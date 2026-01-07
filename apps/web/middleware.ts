import { routing } from '@/lib/i18n/routing'
import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

// 需要认证的路由
const protectedRoutes = ['/time-blocks', '/daily-question']

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 移除 locale 前缀来检查路由
  const pathnameWithoutLocale = pathname.replace(/^\/(zh-CN|en)/, '') || '/'

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route))

  // 检查认证状态（通过 cookie）
  const authToken = request.cookies.get('auth-token')?.value

  if (isProtectedRoute && !authToken) {
    // 未登录访问受保护路由，重定向到登录页
    const locale = pathname.match(/^\/(zh-CN|en)/)?.[1] || ''
    const loginUrl = new URL(locale ? `/${locale}/login` : '/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录访问登录页，重定向到首页
  if (authToken && pathnameWithoutLocale === '/login') {
    const locale = pathname.match(/^\/(zh-CN|en)/)?.[1] || ''
    const homeUrl = new URL(locale ? `/${locale}/time-blocks` : '/time-blocks', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return intlMiddleware(request)
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next (Next.js internals)
  // - Static files
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
