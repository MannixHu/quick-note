import { prisma } from '../src'

// 150+ 深度反思问题，涵盖多个类别
const DAILY_QUESTIONS = [
  // ============ 自我认知 (Self-awareness) ============
  { question: '今天最让你感到有成就感的事情是什么？', category: 'reflection' },
  { question: '如果今天可以重来，你会做什么不同的选择？', category: 'reflection' },
  { question: '最近学到的最重要的一课是什么？', category: 'reflection' },
  { question: '什么事情一直在消耗你的能量，但你还没有处理？', category: 'reflection' },
  { question: '你最近一次真正开心是什么时候？当时在做什么？', category: 'reflection' },
  { question: '你现在最大的担忧是什么？它真的值得你担忧吗？', category: 'reflection' },
  { question: '你最近忽视了自己的哪些需求？', category: 'reflection' },
  { question: '今天你的情绪起伏是什么样的？什么触发了这些变化？', category: 'reflection' },
  { question: '你目前的生活中，什么让你感到最满足？', category: 'reflection' },
  { question: '你最近对自己撒了什么谎？', category: 'reflection' },
  { question: '此刻你最想逃避的是什么？', category: 'reflection' },
  { question: '你的直觉在告诉你什么，但你一直在忽视？', category: 'reflection' },
  { question: '如果你的朋友和你处境相同，你会给他什么建议？', category: 'reflection' },
  { question: '你最近做的哪个决定让你感到骄傲？', category: 'reflection' },
  { question: '你最近在哪件事上妥协了自己的原则？', category: 'reflection' },

  // ============ 成长心态 (Growth Mindset) ============
  { question: '你最害怕的事情是什么？如果克服它会怎样？', category: 'growth' },
  { question: '如果你知道不会失败，你会尝试什么？', category: 'growth' },
  { question: '你的舒适区边界在哪里？最近有没有尝试突破？', category: 'growth' },
  { question: '什么习惯如果坚持一年，会彻底改变你的生活？', category: 'growth' },
  { question: '你最近一次主动学习新技能是什么时候？', category: 'growth' },
  { question: '什么限制性信念正在阻碍你前进？', category: 'growth' },
  { question: '你最近从一次失败中学到了什么？', category: 'growth' },
  { question: '如果再给你一次机会，你会怎样改写过去的某个决定？', category: 'growth' },
  { question: '你今天比昨天进步了多少？哪怕只是一点点。', category: 'growth' },
  { question: '什么技能如果你掌握了，会让你的生活完全不同？', category: 'growth' },
  { question: '你最近有没有接受过有建设性的批评？你是如何回应的？', category: 'growth' },
  { question: '10年后的你会感谢现在的你做什么？', category: 'growth' },
  { question: '你最近一次走出舒适区是什么时候？感觉如何？', category: 'growth' },
  { question: '有什么事情你一直想尝试，但一直找借口不做？', category: 'growth' },
  { question: '你最近克服了什么恐惧或挑战？', category: 'growth' },

  // ============ 感恩 (Gratitude) ============
  { question: '今天有什么值得感恩的小事？', category: 'gratitude' },
  { question: '生活中有谁是你一直想感谢但还没说出口的？', category: 'gratitude' },
  { question: '你拥有的什么东西是很多人梦寐以求的？', category: 'gratitude' },
  { question: '今天谁为你的生活带来了一点阳光？', category: 'gratitude' },
  { question: '你的身体今天为你做了什么？（比如呼吸、行走）', category: 'gratitude' },
  { question: '你生活中有哪些"理所当然"的东西，其实很珍贵？', category: 'gratitude' },
  { question: '最近有什么好运降临到你身上？', category: 'gratitude' },
  { question: '今天有什么让你微笑的事情？', category: 'gratitude' },
  { question: '你的生活中有什么是金钱买不到的？', category: 'gratitude' },
  { question: '如果明天醒来失去了某样东西，你会最想念什么？', category: 'gratitude' },
  { question: '你最近收到的最好的礼物是什么？（不一定是物质的）', category: 'gratitude' },
  { question: '有什么困难最终变成了祝福？', category: 'gratitude' },
  { question: '你的家人或朋友最近做了什么让你感动的事？', category: 'gratitude' },
  { question: '你今天享受了什么简单的快乐？', category: 'gratitude' },
  { question: '回顾过去一年，你最感激的三件事是什么？', category: 'gratitude' },

  // ============ 人际关系 (Relationships) ============
  { question: '你最近和谁的关系需要修复或加深？', category: 'relationships' },
  { question: '你希望别人如何记住你？', category: 'relationships' },
  { question: '谁是你生活中最重要的人？你有多久没有认真和他们交流了？', category: 'relationships' },
  { question: '你最近有没有真正地倾听过别人？', category: 'relationships' },
  { question: '有没有人在等你的一个道歉或一句感谢？', category: 'relationships' },
  { question: '你最近对谁感到失望？你表达出来了吗？', category: 'relationships' },
  { question: '谁的建议对你影响最大？', category: 'relationships' },
  { question: '你最近有没有无意中伤害了谁？', category: 'relationships' },
  { question: '你的社交圈子是在扩大还是缩小？这是你想要的吗？', category: 'relationships' },
  { question: '有谁最近让你感到被理解和支持？', category: 'relationships' },
  { question: '你最想和谁说一声"谢谢你一直在"？', category: 'relationships' },
  { question: '你最近有没有主动联系老朋友？', category: 'relationships' },
  { question: '你在人际关系中最大的弱点是什么？', category: 'relationships' },
  { question: '谁是你可以在凌晨3点打电话求助的人？', category: 'relationships' },
  { question: '你最近有没有给予别人无条件的支持？', category: 'relationships' },

  // ============ 规划目标 (Planning & Goals) ============
  { question: '如果你只能完成今天的一件事，那会是什么？', category: 'planning' },
  { question: '五年后的你会感谢今天的你做了什么决定？', category: 'planning' },
  { question: '有什么事情你一直拖延，但其实只需要5分钟就能完成？', category: 'planning' },
  { question: '你目前最重要的三个目标是什么？今天为它们做了什么？', category: 'planning' },
  { question: '如果你只剩一年的时间，你会如何度过？', category: 'planning' },
  { question: '你现在的日常习惯正在把你带向哪里？', category: 'planning' },
  { question: '你生活中什么事情需要做减法？', category: 'planning' },
  { question: '你的下一个里程碑是什么？距离它还有多远？', category: 'planning' },
  { question: '你最近有没有重新审视过自己的优先级？', category: 'planning' },
  { question: '今天你做了什么对未来的自己有益的事？', category: 'planning' },
  { question: '你目前最大的时间黑洞是什么？', category: 'planning' },
  { question: '你的短期目标和长期愿景是否一致？', category: 'planning' },
  { question: '明天最重要的三件事是什么？', category: 'planning' },
  { question: '你有没有定期回顾自己的目标进度？', category: 'planning' },
  { question: '什么事情你应该说"不"但没有？', category: 'planning' },

  // ============ 价值观 (Values) ============
  { question: '你最近的行为和你的价值观一致吗？', category: 'values' },
  { question: '如果明天就是生命的最后一天，你今天会做什么？', category: 'values' },
  { question: '什么事情让你忘记时间的流逝？', category: 'values' },
  { question: '你最自豪的个人品质是什么？', category: 'values' },
  { question: '你的人生使命是什么？', category: 'values' },
  { question: '什么事情你愿意为之牺牲睡眠和舒适？', category: 'values' },
  { question: '你希望别人在你的葬礼上说什么？', category: 'values' },
  { question: '你最不能容忍的是什么？', category: 'values' },
  { question: '金钱对你来说意味着什么？', category: 'values' },
  { question: '你生活的意义是什么？', category: 'values' },
  { question: '什么是你绝对不会妥协的？', category: 'values' },
  { question: '你的行动是否反映了你真正重视的东西？', category: 'values' },
  { question: '如果没有任何限制，你最想做什么？', category: 'values' },
  { question: '你最近有没有违背自己的价值观？', category: 'values' },
  { question: '什么让你的生命有意义？', category: 'values' },

  // ============ 情绪管理 (Emotions) ============
  { question: '你现在的情绪状态如何？用三个词描述。', category: 'emotions' },
  { question: '今天有什么情绪你没有表达出来？', category: 'emotions' },
  { question: '你最近有没有给自己哭一场的机会？', category: 'emotions' },
  { question: '什么事情最容易触发你的负面情绪？', category: 'emotions' },
  { question: '你如何处理愤怒和沮丧？', category: 'emotions' },
  { question: '你最近感到焦虑是因为什么？', category: 'emotions' },
  { question: '你上一次真正放松是什么时候？', category: 'emotions' },
  { question: '你用什么方式来逃避不舒服的感觉？', category: 'emotions' },
  { question: '今天有没有什么事让你感到受伤？', category: 'emotions' },
  { question: '你最近有没有因为别人的话而影响心情？', category: 'emotions' },
  { question: '你如何对待自己的脆弱？', category: 'emotions' },
  { question: '你的情绪是否经常被外界控制？', category: 'emotions' },
  { question: '你最近有没有对自己太苛刻？', category: 'emotions' },
  { question: '什么能让你在压力下保持冷静？', category: 'emotions' },
  { question: '你有没有允许自己感受所有的情绪，包括不愉快的？', category: 'emotions' },

  // ============ 工作事业 (Career) ============
  { question: '你对目前的工作感到满意吗？为什么？', category: 'career' },
  { question: '你的工作是否让你成为更好的人？', category: 'career' },
  { question: '如果钱不是问题，你会做什么工作？', category: 'career' },
  { question: '你在工作中最大的成就是什么？', category: 'career' },
  { question: '你的职业发展是否符合你最初的期望？', category: 'career' },
  { question: '工作中什么事情让你感到精力充沛？', category: 'career' },
  { question: '你最近有没有在工作中学到新东西？', category: 'career' },
  { question: '你的工作与生活平衡得如何？', category: 'career' },
  { question: '你的职场关系是否健康？', category: 'career' },
  { question: '你目前的工作在五年后还会存在吗？', category: 'career' },
  { question: '你最近有没有为职业发展投资时间或金钱？', category: 'career' },
  { question: '工作中什么事情让你感到最大的挫败感？', category: 'career' },
  { question: '你的领导力或合作能力最近有进步吗？', category: 'career' },
  { question: '你是在为生活工作，还是为工作生活？', category: 'career' },
  { question: '如果要换一个完全不同的职业，你会选择什么？', category: 'career' },

  // ============ 健康生活 (Health & Wellness) ============
  { question: '你今天是怎么对待自己的身体的？', category: 'health' },
  { question: '你的睡眠质量如何？有什么可以改善的？', category: 'health' },
  { question: '你最近有没有进行身体锻炼？', category: 'health' },
  { question: '你的饮食习惯是否支持你的健康目标？', category: 'health' },
  { question: '你最近有没有忽视身体发出的信号？', category: 'health' },
  { question: '你用什么方式来管理压力？', category: 'health' },
  { question: '你有多久没有做健康检查了？', category: 'health' },
  { question: '你的生活方式是否可持续？', category: 'health' },
  { question: '你最近有没有给自己足够的休息时间？', category: 'health' },
  { question: '你的能量水平如何？什么在消耗它？', category: 'health' },
  { question: '你有没有什么不良习惯想要改掉？', category: 'health' },
  { question: '你最近有没有花时间在大自然中？', category: 'health' },
  { question: '你的心理健康状况如何？', category: 'health' },
  { question: '你有没有为自己的健康设定明确的目标？', category: 'health' },
  { question: '什么活动能让你感到身心都充电了？', category: 'health' },

  // ============ 创造力 (Creativity) ============
  { question: '你最近一次创造性地解决问题是什么时候？', category: 'creativity' },
  { question: '你有多久没有尝试新事物了？', category: 'creativity' },
  { question: '什么能激发你的创造力？', category: 'creativity' },
  { question: '你最近有没有做一些纯粹为了乐趣的事？', category: 'creativity' },
  { question: '如果你要写一本书，会是什么主题？', category: 'creativity' },
  { question: '你最近有没有用不同的方式思考老问题？', category: 'creativity' },
  { question: '你的创造力是否被日常琐事淹没了？', category: 'creativity' },
  { question: '你最近读了什么有启发性的书或文章？', category: 'creativity' },
  { question: '你有什么一直想创造但还没开始的东西？', category: 'creativity' },
  { question: '你最近有没有欣赏艺术、音乐或其他创意作品？', category: 'creativity' },
  { question: '你的想象力最近活跃吗？', category: 'creativity' },
  { question: '你有没有记录下突然冒出的好点子？', category: 'creativity' },
  { question: '什么环境最能激发你的创造力？', category: 'creativity' },
  { question: '你最近有没有"疯狂"的想法？', category: 'creativity' },
  { question: '你是否给自己足够的时间去发呆和思考？', category: 'creativity' },

  // ============ 正念冥想 (Mindfulness) ============
  { question: '你今天有没有完全活在当下的时刻？', category: 'mindfulness' },
  { question: '你现在坐着的姿势舒服吗？呼吸顺畅吗？', category: 'mindfulness' },
  { question: '你最近一次放下手机专注于眼前的事是什么时候？', category: 'mindfulness' },
  { question: '你有多久没有看日出或日落了？', category: 'mindfulness' },
  { question: '你最近有没有注意到周围的小细节？', category: 'mindfulness' },
  { question: '你的思绪是更多地在过去、现在还是未来？', category: 'mindfulness' },
  { question: '你有没有给自己安静独处的时间？', category: 'mindfulness' },
  { question: '你最近吃饭的时候有没有真正品味食物？', category: 'mindfulness' },
  { question: '你有没有试过冥想或深呼吸练习？', category: 'mindfulness' },
  { question: '你是否经常被自己的思绪带着跑？', category: 'mindfulness' },
  { question: '你现在的身体有什么感觉？', category: 'mindfulness' },
  { question: '你最近有没有做一件事而不是同时做很多事？', category: 'mindfulness' },
  { question: '你有多久没有真正地看着别人的眼睛说话了？', category: 'mindfulness' },
  { question: '你最近有没有花时间观察自己的思绪？', category: 'mindfulness' },
  { question: '此刻你能听到什么声音？', category: 'mindfulness' },

  // ============ 财务理财 (Finance) ============
  { question: '你对目前的财务状况满意吗？', category: 'finance' },
  { question: '你最近一笔让你后悔的消费是什么？', category: 'finance' },
  { question: '你有没有为未来的自己存钱？', category: 'finance' },
  { question: '你的消费习惯反映了什么价值观？', category: 'finance' },
  { question: '如果收入突然中断，你能支撑多久？', category: 'finance' },
  { question: '你最近有没有学习理财知识？', category: 'finance' },
  { question: '你花钱最多的三个类别是什么？', category: 'finance' },
  { question: '你的钱是否花在了真正重要的事情上？', category: 'finance' },
  { question: '你有没有财务目标和计划？', category: 'finance' },
  { question: '你对金钱的态度是从哪里来的？', category: 'finance' },

  // ============ 生活方式 (Lifestyle) ============
  { question: '你理想的一天是什么样的？', category: 'lifestyle' },
  { question: '你的生活节奏是太快还是太慢？', category: 'lifestyle' },
  { question: '你最近有没有做一些"无用"但快乐的事？', category: 'lifestyle' },
  { question: '你的家/房间是否让你感到平静？', category: 'lifestyle' },
  { question: '你最近有没有旅行或改变环境？', category: 'lifestyle' },
  { question: '你的日常作息是否支持你的目标？', category: 'lifestyle' },
  { question: '你是否拥有太多不需要的东西？', category: 'lifestyle' },
  { question: '你最近有没有为自己创造新的体验？', category: 'lifestyle' },
  { question: '你的周末通常是怎么度过的？', category: 'lifestyle' },
  { question: '你最近有没有打破日常的routine？', category: 'lifestyle' },

  // ============ 未来憧憬 (Future) ============
  { question: '你对未来最期待的是什么？', category: 'future' },
  { question: '你的人生还有什么未完成的梦想？', category: 'future' },
  { question: '你想给未来的自己留下什么？', category: 'future' },
  { question: '你希望一年后的自己是什么样的？', category: 'future' },
  { question: '如果你可以改变世界的一件事，会是什么？', category: 'future' },
  { question: '你的"遗愿清单"上有什么？', category: 'future' },
  { question: '你最想在有生之年看到什么变化？', category: 'future' },
  { question: '退休后你想做什么？', category: 'future' },
  { question: '你想为下一代留下什么？', category: 'future' },
  { question: '你的legacy会是什么？', category: 'future' },
]

async function main() {
  console.log('Start seeding...')

  // 创建默认用户
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
    },
  })
  console.log('User created:', user.email)

  // 批量插入每日问题
  console.log(`Seeding ${DAILY_QUESTIONS.length} daily questions...`)

  // 先清空现有问题（可选，取消注释如果需要重置）
  // await prisma.dailyQuestion.deleteMany({})

  // 使用 upsert 避免重复
  let created = 0
  let skipped = 0

  for (const q of DAILY_QUESTIONS) {
    const existing = await prisma.dailyQuestion.findFirst({
      where: { question: q.question },
    })

    if (!existing) {
      await prisma.dailyQuestion.create({
        data: q,
      })
      created++
    } else {
      skipped++
    }
  }

  console.log(`Daily questions seeded: ${created} created, ${skipped} already existed`)
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
