import { z } from 'zod'
import { createAIService } from '../services/ai'
import { createTRPCRouter, publicProcedure } from '../trpc'

// Sample thought-provoking questions (optimized for INTP deep thinking)
const SAMPLE_QUESTIONS = [
  // === Reflection (反思) ===
  { question: '今天最让你感到有成就感的事情是什么？', category: 'reflection' },
  { question: '如果今天可以重来，你会做什么不同的选择？', category: 'reflection' },
  { question: '最近学到的最重要的一课是什么？', category: 'reflection' },
  { question: '什么事情一直在消耗你的能量，但你还没有处理？', category: 'reflection' },
  { question: '你最近一次真正开心是什么时候？当时在做什么？', category: 'reflection' },
  { question: '回顾过去一周，哪个决定最值得深思？', category: 'reflection' },
  { question: '你最近的失败教会了你什么？', category: 'reflection' },
  { question: '如果能给一周前的自己一个建议，会是什么？', category: 'reflection' },
  { question: '你今天做的哪件事情效率最低？为什么？', category: 'reflection' },
  { question: '最近有什么事情让你改变了原有的看法？', category: 'reflection' },

  // === Planning (规划) ===
  { question: '如果你只能完成今天的一件事，那会是什么？', category: 'planning' },
  { question: '五年后的你会感谢今天的你做了什么决定？', category: 'planning' },
  { question: '有什么事情你一直拖延，但其实只需要5分钟就能完成？', category: 'planning' },
  { question: '你目前最重要的三个目标是什么？今天为它们做了什么？', category: 'planning' },
  { question: '如果时间和金钱都不是问题，你会做什么项目？', category: 'planning' },
  { question: '你的下一个里程碑是什么？需要多久达成？', category: 'planning' },
  { question: '什么技能如果现在开始学习，三年后会让你受益匪浅？', category: 'planning' },
  { question: '你的长期计划中最大的不确定性是什么？', category: 'planning' },
  { question: '如何将你的日常习惯与长期目标更好地对齐？', category: 'planning' },
  { question: '你需要放弃什么才能实现最重要的目标？', category: 'planning' },

  // === Gratitude (感恩) ===
  { question: '今天有什么值得感恩的小事？', category: 'gratitude' },
  { question: '生活中有谁是你一直想感谢但还没说出口的？', category: 'gratitude' },
  { question: '你拥有的什么东西是很多人梦寐以求的？', category: 'gratitude' },
  { question: '你的生活中有什么是你曾经渴望现在已经拥有的？', category: 'gratitude' },
  { question: '谁曾经在你困难时帮助过你？', category: 'gratitude' },

  // === Growth (成长) ===
  { question: '你最害怕的事情是什么？如果克服它会怎样？', category: 'growth' },
  { question: '如果你知道不会失败，你会尝试什么？', category: 'growth' },
  { question: '你的舒适区边界在哪里？最近有没有尝试突破？', category: 'growth' },
  { question: '什么习惯如果坚持一年，会彻底改变你的生活？', category: 'growth' },
  { question: '你最近在哪个领域有了明显的进步？', category: 'growth' },
  { question: '什么是你一直想学但还没开始的？', category: 'growth' },
  { question: '你的哪个弱点最需要改进？', category: 'growth' },
  { question: '什么反馈你最不想听到但最需要听到？', category: 'growth' },

  // === Relationships (人际关系) ===
  { question: '你最近和谁的关系需要修复或加深？', category: 'relationships' },
  { question: '你希望别人如何记住你？', category: 'relationships' },
  { question: '谁是你生活中最重要的人？你有多久没有认真和他们交流了？', category: 'relationships' },
  { question: '你最近一次深度对话是和谁？聊了什么？', category: 'relationships' },
  { question: '你需要从谁那里获得什么支持？', category: 'relationships' },

  // === Values (价值观) ===
  { question: '你最近的行为和你的价值观一致吗？', category: 'values' },
  { question: '如果明天就是生命的最后一天，你今天会做什么？', category: 'values' },
  { question: '什么事情让你忘记时间的流逝？', category: 'values' },
  { question: '你最自豪的个人品质是什么？', category: 'values' },
  { question: '你绝对不愿意妥协的原则是什么？', category: 'values' },
  { question: '什么让你感到生命是有意义的？', category: 'values' },

  // === Logic & Analysis (逻辑分析) - INTP 特色 ===
  { question: '你最近遇到的最有趣的逻辑悖论是什么？', category: 'logic' },
  { question: '如果要用第一性原理分析你当前面临的问题，你会如何拆解？', category: 'logic' },
  { question: '你认为哪个广泛接受的观点其实经不起推敲？', category: 'logic' },
  { question: '最近有什么事情让你发现了自己思维的盲点？', category: 'logic' },
  { question: '如何证伪你最坚信的一个观点？', category: 'logic' },
  { question: '你最近做的哪个决定使用了错误的推理？', category: 'logic' },
  { question: '如果要设计一个实验来验证你的某个假设，你会怎么做？', category: 'logic' },
  { question: '你倾向于归纳推理还是演绎推理？为什么？', category: 'logic' },
  { question: '哪个认知偏见最经常影响你的判断？', category: 'logic' },
  { question: '你如何区分相关性和因果性？', category: 'logic' },
  { question: '最近有什么事情你需要更多数据才能下结论？', category: 'logic' },
  { question: '你的思维中有哪些未经检验的假设？', category: 'logic' },
  { question: '如何用奥卡姆剃刀原则简化你正在思考的问题？', category: 'logic' },
  { question: '你最近发现的最优雅的解决方案是什么？', category: 'logic' },
  { question: '什么问题看似简单但实际上极其复杂？', category: 'logic' },

  // === Philosophy (哲学思考) - INTP 特色 ===
  { question: '你认为意识的本质是什么？', category: 'philosophy' },
  { question: '自由意志是真实存在的还是一种幻觉？', category: 'philosophy' },
  { question: '什么定义了"你"的身份认同？', category: 'philosophy' },
  { question: '如果记忆可以被完美复制，复制品是否拥有同样的"自我"？', category: 'philosophy' },
  { question: '客观真理是否存在？还是所有真理都是相对的？', category: 'philosophy' },
  { question: '道德是被发现的还是被发明的？', category: 'philosophy' },
  { question: '什么让一个行为成为"正确"的行为？', category: 'philosophy' },
  { question: '时间是线性的还是我们的感知让它看起来如此？', category: 'philosophy' },
  { question: '无限是一个真实的概念还是数学抽象？', category: 'philosophy' },
  {
    question: '如果一棵树倒在森林里没人听到，它是否发出了声音？你如何看待这个问题？',
    category: 'philosophy',
  },
  { question: '人类是否能真正理解自己无法体验的事物？', category: 'philosophy' },
  { question: '语言是否限制了我们的思维？', category: 'philosophy' },
  { question: '什么是"真实"？我们如何确定我们不是在模拟中？', category: 'philosophy' },
  { question: '如果你可以选择永生，你会选择吗？为什么？', category: 'philosophy' },
  { question: '什么是美？美是主观的还是客观的？', category: 'philosophy' },
  { question: '知识的极限在哪里？有些事情是永远不可知的吗？', category: 'philosophy' },
  { question: '我们有责任改善后代的生活吗？为什么？', category: 'philosophy' },
  { question: '如果可以选择，你希望知道自己何时死亡吗？', category: 'philosophy' },
  { question: '什么是幸福？它是目标还是副产品？', category: 'philosophy' },
  { question: '人类的存在有固有的意义，还是我们需要创造意义？', category: 'philosophy' },

  // === Science & Technology (科学技术) - INTP 特色 ===
  { question: '哪个科学未解之谜最让你着迷？', category: 'science' },
  { question: '如果你能参与解决一个科学问题，你会选择哪个？', category: 'science' },
  { question: '你认为AI何时会达到通用人工智能？这意味着什么？', category: 'science' },
  { question: '量子力学最让你困惑的概念是什么？', category: 'science' },
  { question: '你认为人类会成为多行星物种吗？时间表是什么？', category: 'science' },
  { question: '哪项新兴技术最可能改变未来50年？', category: 'science' },
  { question: '如果可以时间旅行，你会去验证哪个历史事件？', category: 'science' },
  { question: '你认为暗物质和暗能量的本质是什么？', category: 'science' },
  { question: '人类是否应该追求基因编辑技术？边界在哪里？', category: 'science' },
  { question: '你如何看待脑机接口的未来？', category: 'science' },
  { question: '如果费米悖论有解答，你认为最可能是哪个？', category: 'science' },
  { question: '什么技术如果被发明会彻底改变人类社会？', category: 'science' },
  { question: '你认为意识可以被上传到数字介质吗？', category: 'science' },
  { question: '哪个被否定的科学理论你认为值得重新审视？', category: 'science' },
  { question: '如果外星文明存在，它们的思维方式会与我们有多大差异？', category: 'science' },

  // === Abstract Thinking (抽象思维) - INTP 特色 ===
  { question: '如果你要向外星人解释"爱"这个概念，你会怎么说？', category: 'abstract' },
  { question: '数学是被发现的还是被发明的？', category: 'abstract' },
  { question: '什么是"无"？"无"存在吗？', category: 'abstract' },
  { question: '如果宇宙是有限的，它的边界之外是什么？', category: 'abstract' },
  { question: '思维实验：如果所有人同时睡着，现实还存在吗？', category: 'abstract' },
  { question: '完美的圆在物理世界中存在吗？', category: 'abstract' },
  { question: '颜色是物体的属性还是观察者的体验？', category: 'abstract' },
  { question: '如果记忆完全不可靠，个人身份还有意义吗？', category: 'abstract' },
  { question: '信息是物质的还是非物质的？', category: 'abstract' },
  { question: '随机性是真实的还是我们无知的体现？', category: 'abstract' },
  { question: '如果你可以设计一个完美的语言，它会有什么特征？', category: 'abstract' },
  { question: '一个悖论能同时为真和为假吗？', category: 'abstract' },
  { question: '如果模拟假说为真，这对我们的行为有什么影响？', category: 'abstract' },
  { question: '概念如何在没有语言的情况下存在？', category: 'abstract' },
  { question: '什么是"理解"？AI真的能理解事物吗？', category: 'abstract' },

  // === Systems Thinking (系统思维) - INTP 特色 ===
  { question: '你生活中哪个系统最需要优化？', category: 'systems' },
  { question: '什么看似独立的事物实际上是相互关联的？', category: 'systems' },
  { question: '你的日常routine中有什么可以自动化的？', category: 'systems' },
  { question: '哪个反馈循环最影响你的行为？', category: 'systems' },
  { question: '如果把你的生活看作一个系统，瓶颈在哪里？', category: 'systems' },
  { question: '什么小改变可能产生巨大的连锁反应？', category: 'systems' },
  { question: '你的决策过程可以用什么模型来描述？', category: 'systems' },
  { question: '哪个复杂系统的运作方式最让你印象深刻？', category: 'systems' },
  { question: '如何减少你生活中的熵增？', category: 'systems' },
  { question: '什么是你需要但还没有建立的个人系统？', category: 'systems' },
  { question: '你的思维系统有什么单点故障？', category: 'systems' },
  { question: '如何设计一个更好的个人知识管理系统？', category: 'systems' },
  { question: '什么习惯形成了正向反馈循环？', category: 'systems' },
  { question: '你的生产力系统最大的漏洞是什么？', category: 'systems' },
  { question: '如何让你的工作流程更具弹性？', category: 'systems' },

  // === Creativity & Ideas (创意想法) - INTP 特色 ===
  { question: '你最近想到的最疯狂的想法是什么？', category: 'creativity' },
  { question: '如果可以创造任何东西，你会创造什么？', category: 'creativity' },
  { question: '哪两个不相关的概念组合起来可能产生有趣的结果？', category: 'creativity' },
  { question: '你的想法从哪里来？如何培养更多想法？', category: 'creativity' },
  { question: '如果要写一本书，你会写关于什么？', category: 'creativity' },
  { question: '什么问题如果用完全相反的方式思考会有新发现？', category: 'creativity' },
  { question: '你的哪个"疯狂想法"其实值得认真考虑？', category: 'creativity' },
  { question: '如何用类比来解释一个复杂的概念？', category: 'creativity' },
  { question: '什么是你独特的看问题的角度？', category: 'creativity' },
  { question: '如果限制被移除，你会如何重新设计某个事物？', category: 'creativity' },

  // === Knowledge & Learning (知识学习) - INTP 特色 ===
  { question: '你最近在哪个领域的理解有了质的飞跃？', category: 'knowledge' },
  { question: '什么是你假装理解但其实不太懂的？', category: 'knowledge' },
  { question: '哪本书或文章最近改变了你的思维方式？', category: 'knowledge' },
  { question: '你的知识结构中最大的空白是什么？', category: 'knowledge' },
  { question: '如何更有效地将新知识与已有知识连接？', category: 'knowledge' },
  { question: '什么是你知道但还没有真正理解的？', category: 'knowledge' },
  { question: '你如何验证自己真正学会了某样东西？', category: 'knowledge' },
  { question: '哪个跨学科连接让你印象深刻？', category: 'knowledge' },
  { question: '你最希望深入学习的三个领域是什么？', category: 'knowledge' },
  { question: '什么是你需要"忘掉"才能进步的？', category: 'knowledge' },
  { question: '你的学习方法有什么可以改进的地方？', category: 'knowledge' },
  { question: '知识和智慧的区别是什么？', category: 'knowledge' },
  { question: '你如何处理与你现有信念冲突的新信息？', category: 'knowledge' },
  { question: '什么是你最近学到的反直觉的事实？', category: 'knowledge' },
  { question: '如果只能保留一种学习能力，你会选择哪种？', category: 'knowledge' },

  // === Self-Understanding (自我认知) - INTP 特色 ===
  { question: '你最核心的驱动力是什么？', category: 'self' },
  { question: '什么情况下你会进入心流状态？', category: 'self' },
  { question: '你的思维模式有什么独特之处？', category: 'self' },
  { question: '你倾向于分析还是综合信息？', category: 'self' },
  { question: '你的直觉在什么情况下最准确？', category: 'self' },
  { question: '你如何描述自己的内在对话？', category: 'self' },
  { question: '什么会立刻吸引你的注意力？', category: 'self' },
  { question: '你在什么情况下最有创造力？', category: 'self' },
  { question: '你的能量主要来自内在还是外在？', category: 'self' },
  { question: '你如何区分你真正想要的和你认为应该想要的？', category: 'self' },
  { question: '什么是你最不愿意承认的个人特点？', category: 'self' },
  { question: '你的思维在什么时候最清晰？', category: 'self' },
  { question: '什么会让你感到真正的满足？', category: 'self' },
  { question: '你的哪些特点是双刃剑？', category: 'self' },
  { question: '你如何看待自己与"正常人"的不同？', category: 'self' },

  // === Future & Possibilities (未来可能性) - INTP 特色 ===
  { question: '你认为人类文明最可能的未来是什么？', category: 'future' },
  { question: '10年后，什么现在的常识会被证明是错误的？', category: 'future' },
  { question: '哪个当前的趋势最可能在未来产生巨大影响？', category: 'future' },
  { question: '如果你可以看到任何一个未来事件的结果，你会选择什么？', category: 'future' },
  { question: '什么技术可能在你有生之年实现？', category: 'future' },
  { question: '你对未来最乐观和最悲观的预测分别是什么？', category: 'future' },
  { question: '人类社会下一个重大转变可能是什么？', category: 'future' },
  { question: '什么是你希望活着看到的事情？', category: 'future' },
  { question: '如果可以给50年后的人类留言，你会说什么？', category: 'future' },
  { question: '什么现在看似不可能的事情你认为终将实现？', category: 'future' },

  // === Thought Experiments (思维实验) - INTP 特色 ===
  {
    question: '如果你可以与历史上任何一位思想家对话，你会选择谁？聊什么？',
    category: 'thought_experiment',
  },
  { question: '如果你突然拥有读心术，你会如何使用它？', category: 'thought_experiment' },
  {
    question: '如果全人类必须做出一个统一的决定，你认为我们能达成什么共识？',
    category: 'thought_experiment',
  },
  { question: '如果你可以设计一个完美的社会，它会是什么样子？', category: 'thought_experiment' },
  { question: '如果金钱不存在，人类会如何组织社会？', category: 'thought_experiment' },
  { question: '如果你可以改变人类的一个本能，你会改变什么？', category: 'thought_experiment' },
  { question: '如果每个人都无法说谎，世界会变成什么样？', category: 'thought_experiment' },
  { question: '如果你可以永远记住所有事情，这是祝福还是诅咒？', category: 'thought_experiment' },
  { question: '如果你可以体验另一个人的生活一天，你会选择谁？', category: 'thought_experiment' },
  { question: '如果你是AI，你如何证明自己有意识？', category: 'thought_experiment' },
  { question: '如果你可以设计一种新的感官，它会感知什么？', category: 'thought_experiment' },
  { question: '如果地球上只剩下1000人，你认为应该如何重建文明？', category: 'thought_experiment' },
  {
    question: '如果你可以在任何时代的任何地方生活，你会选择哪里？',
    category: 'thought_experiment',
  },
  { question: '如果人类寿命延长到500年，社会会如何改变？', category: 'thought_experiment' },
  { question: '如果你可以让所有人理解一个概念，你会选择什么？', category: 'thought_experiment' },

  // === Decision Making (决策思考) - INTP 特色 ===
  { question: '你最近做的最困难的决定是什么？你是如何做出的？', category: 'decision' },
  { question: '什么因素最影响你的决策质量？', category: 'decision' },
  { question: '你如何处理信息不完整时需要做决定的情况？', category: 'decision' },
  { question: '你做决定时更依赖数据还是直觉？', category: 'decision' },
  { question: '什么决定你一直在推迟？为什么？', category: 'decision' },
  { question: '如何减少决策疲劳？', category: 'decision' },
  { question: '你的哪个决策框架最有效？', category: 'decision' },
  { question: '什么是你做过的最违反直觉但正确的决定？', category: 'decision' },
  { question: '你如何权衡短期收益和长期影响？', category: 'decision' },
  { question: '什么决定如果重新做，你会做出不同选择？', category: 'decision' },

  // === Curiosity & Wonder (好奇探索) - INTP 特色 ===
  { question: '你目前最想找到答案的问题是什么？', category: 'curiosity' },
  { question: '什么现象让你感到惊奇？', category: 'curiosity' },
  { question: '你最近发现的最有趣的事实是什么？', category: 'curiosity' },
  { question: '什么是你小时候好奇但至今仍未完全理解的？', category: 'curiosity' },
  { question: '如果可以即刻知道任何问题的答案，你会问什么？', category: 'curiosity' },
  { question: '什么领域你越了解越觉得神奇？', category: 'curiosity' },
  { question: '你最近的"原来如此"时刻是什么？', category: 'curiosity' },
  { question: '什么是你从未质疑过但也许应该质疑的？', category: 'curiosity' },
  { question: '你的好奇心最近带你去了哪里？', category: 'curiosity' },
  { question: '什么问题你已经思考了很久？', category: 'curiosity' },
]

export const dailyQuestionRouter = createTRPCRouter({
  // Initialize questions in database (run once)
  seedQuestions: publicProcedure.mutation(async ({ ctx }) => {
    const existingCount = await ctx.prisma.dailyQuestion.count()
    if (existingCount > 0) {
      return { message: 'Questions already seeded', count: existingCount }
    }

    await ctx.prisma.dailyQuestion.createMany({
      data: SAMPLE_QUESTIONS,
    })

    return { message: 'Questions seeded successfully', count: SAMPLE_QUESTIONS.length }
  }),

  // Get a random question (not tied to daily limit)
  getRandomQuestion: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get recently answered question IDs to avoid repetition
      const recentAnswers = await ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { questionId: true },
      })

      const excludeIds = recentAnswers.map((a) => a.questionId)

      // Find questions not recently answered
      const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
        where: {
          id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
        },
      })

      // If all questions have been used, get any random one
      const questions =
        availableQuestions.length > 0
          ? availableQuestions
          : await ctx.prisma.dailyQuestion.findMany()

      if (questions.length === 0) {
        return null
      }

      const randomIndex = Math.floor(Math.random() * questions.length)
      const randomQuestion = questions[randomIndex]
      return randomQuestion ?? null
    }),

  // Answer a question (create new record each time)
  answerQuestionNew: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        answer: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create a new answer record (no upsert, allows multiple answers)
      const result = await ctx.prisma.questionAnswer.create({
        data: {
          userId: input.userId,
          questionId: input.questionId,
          answer: input.answer,
          date: new Date(),
        },
        include: {
          question: true,
        },
      })

      return result
    }),

  // Get today's question for a user
  getTodayQuestion: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if user already has a question assigned for today
      let userDailyQuestion = await ctx.prisma.userDailyQuestion.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
        include: {
          question: true,
        },
      })

      if (!userDailyQuestion) {
        // Get a random question that user hasn't seen recently
        const recentQuestionIds = await ctx.prisma.userDailyQuestion.findMany({
          where: { userId: input.userId },
          orderBy: { date: 'desc' },
          take: 10,
          select: { questionId: true },
        })

        const excludeIds = recentQuestionIds.map((q) => q.questionId)

        // Find a question not in recent list
        const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        // If all questions have been used, get any random one
        const questions =
          availableQuestions.length > 0
            ? availableQuestions
            : await ctx.prisma.dailyQuestion.findMany()

        if (questions.length === 0) {
          return null
        }

        const randomIndex = Math.floor(Math.random() * questions.length)
        const randomQuestion = questions[randomIndex]
        if (!randomQuestion) {
          return null
        }

        userDailyQuestion = await ctx.prisma.userDailyQuestion.create({
          data: {
            userId: input.userId,
            questionId: randomQuestion.id,
            date: today,
          },
          include: {
            question: true,
          },
        })
      }

      // Get user's answer if exists
      const answer = await ctx.prisma.questionAnswer.findUnique({
        where: {
          userId_questionId_date: {
            userId: input.userId,
            questionId: userDailyQuestion.questionId,
            date: today,
          },
        },
      })

      return {
        ...userDailyQuestion,
        answer: answer?.answer || null,
      }
    }),

  // Answer today's question
  answerQuestion: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        answer: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Create or update answer
      const result = await ctx.prisma.questionAnswer.upsert({
        where: {
          userId_questionId_date: {
            userId: input.userId,
            questionId: input.questionId,
            date: today,
          },
        },
        create: {
          userId: input.userId,
          questionId: input.questionId,
          answer: input.answer,
          date: today,
        },
        update: {
          answer: input.answer,
        },
      })

      // Mark as answered
      await ctx.prisma.userDailyQuestion.updateMany({
        where: {
          userId: input.userId,
          date: today,
        },
        data: { answered: true },
      })

      return result
    }),

  // Get answer history
  getAnswerHistory: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        include: {
          question: true,
        },
        orderBy: { date: 'desc' },
        take: input.limit,
      })
    }),

  // Get all questions (for admin)
  getAllQuestions: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.dailyQuestion.findMany({
      orderBy: { category: 'asc' },
    })
  }),

  // Add new question (for admin)
  addQuestion: publicProcedure
    .input(
      z.object({
        question: z.string().min(1),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dailyQuestion.create({
        data: input,
      })
    }),

  // ============================================
  // AI-Generated Questions
  // ============================================

  /**
   * 使用 AI 生成新问题并保存到数据库
   * 支持前端传入 AI 配置，或使用环境变量配置
   */
  generateAIQuestions: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(20).default(5),
        categories: z.array(z.string()).optional(),
        aiConfig: z
          .object({
            provider: z.enum(['openrouter', 'deepseek']),
            apiKey: z.string(),
            model: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const aiService = createAIService(input.aiConfig)

      if (!aiService) {
        throw new Error(
          'AI service not configured. Please provide AI config or set environment variables.'
        )
      }

      try {
        // 使用 AI 生成问题
        const generatedQuestions = await aiService.generateQuestions(input.count, input.categories)

        // 保存到数据库
        const created = await ctx.prisma.dailyQuestion.createMany({
          data: generatedQuestions,
          skipDuplicates: true,
        })

        return {
          success: true,
          count: created.count,
          questions: generatedQuestions,
        }
      } catch (error) {
        console.error('AI generation error:', error)
        throw new Error(`Failed to generate AI questions: ${(error as Error).message}`)
      }
    }),

  /**
   * 为用户生成个性化的今日问题（基于历史回答）
   * 如果 AI 未配置或失败，降级到数据库随机问题
   */
  getTodayQuestionWithAI: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        usePersonalization: z.boolean().default(false),
        aiConfig: z
          .object({
            provider: z.enum(['openrouter', 'deepseek']),
            apiKey: z.string(),
            model: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 检查是否已有今日问题
      let userDailyQuestion = await ctx.prisma.userDailyQuestion.findUnique({
        where: {
          userId_date: {
            userId: input.userId,
            date: today,
          },
        },
        include: {
          question: true,
        },
      })

      if (userDailyQuestion) {
        // 已有问题，直接返回
        const answer = await ctx.prisma.questionAnswer.findUnique({
          where: {
            userId_questionId_date: {
              userId: input.userId,
              questionId: userDailyQuestion.questionId,
              date: today,
            },
          },
        })

        return {
          ...userDailyQuestion,
          answer: answer?.answer || null,
          source: 'existing' as const,
        }
      }

      // 尝试使用 AI 生成个性化问题
      const aiService = createAIService(input.aiConfig)
      let newQuestion: { question: string; category: string } | null = null
      let source: 'ai' | 'database' = 'database'

      if (aiService && input.usePersonalization) {
        try {
          // 获取用户最近的回答历史
          const answerHistory = await ctx.prisma.questionAnswer.findMany({
            where: { userId: input.userId },
            include: { question: true },
            orderBy: { date: 'desc' },
            take: 5,
          })

          if (answerHistory.length > 0) {
            // 生成个性化问题
            const generated = await aiService.generatePersonalizedQuestion(
              answerHistory.map((a) => ({
                question: a.question.question,
                answer: a.answer,
                date: a.date,
              }))
            )

            newQuestion = generated
            source = 'ai'
          }
        } catch (error) {
          console.error('AI personalization failed, fallback to database:', error)
        }
      }

      // 如果 AI 生成失败或未启用，从数据库随机选择
      if (!newQuestion) {
        const recentQuestionIds = await ctx.prisma.userDailyQuestion.findMany({
          where: { userId: input.userId },
          orderBy: { date: 'desc' },
          take: 10,
          select: { questionId: true },
        })

        const excludeIds = recentQuestionIds.map((q) => q.questionId)

        const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        const questions =
          availableQuestions.length > 0
            ? availableQuestions
            : await ctx.prisma.dailyQuestion.findMany()

        if (questions.length === 0) {
          throw new Error('No questions available in database')
        }

        const randomIndex = Math.floor(Math.random() * questions.length)
        const randomQuestion = questions[randomIndex]
        if (!randomQuestion) {
          throw new Error('Failed to select random question')
        }
        newQuestion = {
          question: randomQuestion.question,
          category: randomQuestion.category || 'reflection',
        }
      }

      // 如果是 AI 生成的，先保存到数据库
      let questionRecord: { id: string; question: string; category: string | null }
      if (source === 'ai') {
        questionRecord = await ctx.prisma.dailyQuestion.create({
          data: {
            question: newQuestion.question,
            category: newQuestion.category,
          },
        })
      } else {
        // 从数据库查询已有问题
        const found = await ctx.prisma.dailyQuestion.findFirst({
          where: { question: newQuestion.question },
        })
        if (!found) {
          throw new Error('Question not found in database')
        }
        questionRecord = found
      }

      // 创建用户每日问题记录
      userDailyQuestion = await ctx.prisma.userDailyQuestion.create({
        data: {
          userId: input.userId,
          questionId: questionRecord.id,
          date: today,
        },
        include: {
          question: true,
        },
      })

      return {
        ...userDailyQuestion,
        answer: null,
        source,
      }
    }),

  /**
   * 检查 AI 服务状态
   */
  checkAIStatus: publicProcedure.query(() => {
    const provider = process.env.AI_PROVIDER
    const hasKey =
      (provider === 'openrouter' && !!process.env.OPENROUTER_API_KEY) ||
      (provider === 'deepseek' && !!process.env.DEEPSEEK_API_KEY)

    return {
      configured: !!provider && hasKey,
      provider: provider || 'none',
      model: process.env.AI_MODEL || 'default',
    }
  }),

  /**
   * 测试 AI 连接 (Ping)
   */
  pingAI: publicProcedure
    .input(
      z.object({
        aiConfig: z.object({
          provider: z.enum(['openrouter', 'deepseek']),
          apiKey: z.string(),
          model: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const aiService = createAIService(input.aiConfig)

      if (!aiService) {
        throw new Error('Failed to create AI service')
      }

      try {
        const result = await aiService.ping()
        return {
          success: true,
          ...result,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          latency: 0,
          model: input.aiConfig.model || 'default',
          provider: input.aiConfig.provider,
        }
      }
    }),
})
