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

  // === Psychology & Mind (心理与心智) - INTP 特色 ===
  { question: '你的潜意识在什么情况下会影响你的决定？', category: 'psychology' },
  { question: '什么情绪你最难以识别和命名？', category: 'psychology' },
  { question: '你的大脑如何欺骗你？', category: 'psychology' },
  { question: '什么触发因素会让你立刻进入防御状态？', category: 'psychology' },
  { question: '你的思维在压力下会发生什么变化？', category: 'psychology' },
  { question: '什么是你童年形成但至今仍影响你的信念？', category: 'psychology' },
  { question: '你如何区分真实的直觉和恐惧伪装的直觉？', category: 'psychology' },
  { question: '什么是你的心理防御机制？', category: 'psychology' },
  { question: '你的自我对话通常是什么语调？', category: 'psychology' },
  { question: '什么会触发你的拖延行为？', category: 'psychology' },
  { question: '你如何处理认知失调？', category: 'psychology' },
  { question: '什么是你逃避但需要面对的心理议题？', category: 'psychology' },
  { question: '你的注意力模式是什么样的？', category: 'psychology' },
  { question: '什么会让你感到existential anxiety？', category: 'psychology' },
  { question: '你的心智模型如何影响你对现实的感知？', category: 'psychology' },

  // === Mathematics & Patterns (数学与模式) - INTP 特色 ===
  { question: '你在日常生活中发现了什么有趣的数学模式？', category: 'mathematics' },
  { question: '哪个数学概念最让你感到优美？', category: 'mathematics' },
  { question: '如果可以证明任何一个未解决的数学问题，你会选哪个？', category: 'mathematics' },
  { question: '无穷大有不同的大小，这个概念对你意味着什么？', category: 'mathematics' },
  { question: '概率思维如何改变了你看待世界的方式？', category: 'mathematics' },
  { question: '你如何在混乱中寻找模式？', category: 'mathematics' },
  { question: '哪个数学悖论最困扰你？', category: 'mathematics' },
  { question: '指数增长的直觉为什么如此困难？', category: 'mathematics' },
  { question: '你如何用数学思维解决日常问题？', category: 'mathematics' },
  { question: '什么是你最喜欢的数学证明？为什么？', category: 'mathematics' },
  { question: '黄金比例为什么在自然界中如此普遍？', category: 'mathematics' },
  { question: '你如何理解"所有模型都是错的，但有些是有用的"？', category: 'mathematics' },
  { question: '分形几何如何改变了你对复杂性的理解？', category: 'mathematics' },
  { question: '博弈论如何帮助你理解人类行为？', category: 'mathematics' },
  { question: '什么是你见过的最优雅的数学结构？', category: 'mathematics' },

  // === Ethics & Morality (伦理与道德) - INTP 特色 ===
  { question: '电车难题揭示了你怎样的道德直觉？', category: 'ethics' },
  { question: '功利主义和义务论，你更倾向于哪个？为什么？', category: 'ethics' },
  { question: '什么情况下撒谎是道德的？', category: 'ethics' },
  { question: '你如何定义"公平"？', category: 'ethics' },
  { question: '对未来世代，我们有什么道德责任？', category: 'ethics' },
  { question: '动物权利的边界在哪里？', category: 'ethics' },
  { question: '隐私权和公共利益如何平衡？', category: 'ethics' },
  { question: '道德相对主义有没有边界？', category: 'ethics' },
  { question: '什么是你的道德底线？', category: 'ethics' },
  { question: '好的意图能否为不好的结果辩护？', category: 'ethics' },
  { question: 'AI应该有权利吗？标准是什么？', category: 'ethics' },
  { question: '你如何判断一个社会制度是否公正？', category: 'ethics' },
  { question: '个人自由和集体福祉之间的张力如何解决？', category: 'ethics' },
  { question: '什么是你曾经认为不道德但现在改变看法的事？', category: 'ethics' },
  { question: '道德进步是真实的还是只是文化变迁？', category: 'ethics' },

  // === Language & Communication (语言与沟通) - INTP 特色 ===
  { question: '语言如何塑造你的思维？', category: 'language' },
  { question: '什么概念在你的母语中无法完美表达？', category: 'language' },
  { question: '你最喜欢的外语中没有对应中文词汇的概念是什么？', category: 'language' },
  { question: '沉默能传达什么信息？', category: 'language' },
  { question: '你如何向5岁小孩解释一个复杂概念？', category: 'language' },
  { question: '什么是你经常被误解的话？', category: 'language' },
  { question: '语言的模糊性是bug还是feature？', category: 'language' },
  { question: '你如何通过语言影响他人的思维？', category: 'language' },
  { question: '什么是你最喜欢的英文单词？为什么？', category: 'language' },
  { question: '如果要创造一个新词，你会创造什么？', category: 'language' },
  { question: '隐喻如何帮助或阻碍理解？', category: 'language' },
  { question: '编程语言和自然语言有什么本质区别？', category: 'language' },
  { question: '你的内心独白使用什么语言？', category: 'language' },
  { question: '什么是你曾经误解很久的词？', category: 'language' },
  { question: '如何用最少的词传达最多的信息？', category: 'language' },

  // === Consciousness & Perception (意识与感知) - INTP 特色 ===
  { question: '你如何知道其他人有意识？', category: 'consciousness' },
  { question: '梦境告诉了你什么关于意识的本质？', category: 'consciousness' },
  { question: '如果你的感知完全不同，你还是"你"吗？', category: 'consciousness' },
  { question: '冥想如何改变你对心智的理解？', category: 'consciousness' },
  { question: '什么是你无法用语言描述的体验？', category: 'consciousness' },
  { question: '你的意识在睡眠时去了哪里？', category: 'consciousness' },
  { question: '婴儿的意识体验是什么样的？', category: 'consciousness' },
  { question: '你如何区分想象和记忆？', category: 'consciousness' },
  { question: '注意力的本质是什么？', category: 'consciousness' },
  { question: '如果大脑被完美复制，意识会在两个地方同时存在吗？', category: 'consciousness' },
  { question: '什么是"自我"的边界？', category: 'consciousness' },
  { question: '你的感知有多少是大脑的构建而非真实输入？', category: 'consciousness' },
  { question: '痛苦的意识体验能被完全理解吗？', category: 'consciousness' },
  { question: '你如何知道你现在不是在做梦？', category: 'consciousness' },
  { question: '意识的进化优势是什么？', category: 'consciousness' },

  // === History & Civilization (历史与文明) - INTP 特色 ===
  { question: '历史上哪个转折点如果不同，世界会截然不同？', category: 'history' },
  { question: '哪个古代文明最让你着迷？为什么？', category: 'history' },
  { question: '历史是线性进步的还是循环的？', category: 'history' },
  { question: '哪个历史人物被严重低估了？', category: 'history' },
  { question: '什么历史教训人类反复忘记？', category: 'history' },
  { question: '如果你能改变一个历史事件，你会选择哪个？', category: 'history' },
  { question: '文明崩溃的共同模式是什么？', category: 'history' },
  { question: '哪项发明对人类历史影响最大？', category: 'history' },
  { question: '我们这个时代会被历史如何记住？', category: 'history' },
  { question: '历史的"大人物"理论和"社会力量"理论哪个更准确？', category: 'history' },
  { question: '什么是人类历史上最被低估的发明？', category: 'history' },
  { question: '你如何从历史中学习而不过度简化？', category: 'history' },
  { question: '哪个消失的文明你最想了解更多？', category: 'history' },
  { question: '历史决定论有多大程度是真的？', category: 'history' },
  { question: '什么是你希望能亲眼见证的历史时刻？', category: 'history' },

  // === Paradoxes & Puzzles (悖论与谜题) - INTP 特色 ===
  { question: '忒修斯之船悖论对身份意味着什么？', category: 'paradox' },
  { question: '全能悖论（上帝能否创造他举不起的石头）如何解决？', category: 'paradox' },
  { question: '祖父悖论对时间旅行意味着什么？', category: 'paradox' },
  { question: '说谎者悖论（"这句话是假的"）如何处理？', category: 'paradox' },
  { question: '芝诺悖论对运动的本质说明了什么？', category: 'paradox' },
  { question: '双缝实验的结果如何改变你对现实的理解？', category: 'paradox' },
  { question: '无限猴子定理意味着什么？', category: 'paradox' },
  { question: '生日悖论为什么违反直觉？', category: 'paradox' },
  { question: '辛普森悖论如何影响数据解读？', category: 'paradox' },
  { question: '你遇到过的最难解的逻辑谜题是什么？', category: 'paradox' },
  { question: '不完备性定理对知识的极限意味着什么？', category: 'paradox' },
  { question: '船长悖论对决策意味着什么？', category: 'paradox' },
  { question: '纽康悖论你会选择一个盒子还是两个？', category: 'paradox' },
  { question: '全知和自由意志如何共存？', category: 'paradox' },
  { question: '什么悖论你曾经误解后来恍然大悟？', category: 'paradox' },

  // === Meta-cognition (元认知) - INTP 特色 ===
  { question: '你如何思考"思考"本身？', category: 'metacognition' },
  { question: '你的思维过程中有什么模式？', category: 'metacognition' },
  { question: '你如何知道你知道某件事？', category: 'metacognition' },
  { question: '你的认知盲点在哪里？', category: 'metacognition' },
  { question: '你如何监控自己的思维质量？', category: 'metacognition' },
  { question: '什么时候你应该相信自己的判断，什么时候不应该？', category: 'metacognition' },
  { question: '你如何区分深思熟虑和过度思考？', category: 'metacognition' },
  { question: '你的推理能力在哪些领域最强？最弱？', category: 'metacognition' },
  { question: '你如何检测自己的偏见？', category: 'metacognition' },
  { question: '思考太多是否可能？边界在哪里？', category: 'metacognition' },
  { question: '你如何培养更好的思维习惯？', category: 'metacognition' },
  { question: '你的知识的知识（元知识）是什么？', category: 'metacognition' },
  { question: '你如何平衡分析和行动？', category: 'metacognition' },
  { question: '什么是你思维中的"高速公路"（经常使用的思维路径）？', category: 'metacognition' },
  { question: '你如何训练自己更好地思考？', category: 'metacognition' },

  // === Problem Solving (问题解决) - INTP 特色 ===
  { question: '你解决问题的标志性方法是什么？', category: 'problem_solving' },
  { question: '什么类型的问题最能激发你的热情？', category: 'problem_solving' },
  { question: '你如何判断一个问题是否值得解决？', category: 'problem_solving' },
  { question: '当你陷入僵局时，你会怎么做？', category: 'problem_solving' },
  { question: '什么是你解决过的最优雅的问题？', category: 'problem_solving' },
  { question: '如何将一个大问题分解成可处理的部分？', category: 'problem_solving' },
  { question: '你如何判断是继续尝试还是放弃换方向？', category: 'problem_solving' },
  { question: '什么启发法对你最有效？', category: 'problem_solving' },
  { question: '你如何处理ill-defined问题？', category: 'problem_solving' },
  { question: '什么是你花了最长时间才解决的问题？', category: 'problem_solving' },
  { question: '你如何在解决问题时保持动力？', category: 'problem_solving' },
  { question: '什么问题你放弃了但后来后悔？', category: 'problem_solving' },
  { question: '你如何验证你的解决方案是正确的？', category: 'problem_solving' },
  { question: '最简单的解决方案为什么往往最好？', category: 'problem_solving' },
  { question: '你如何从失败的解决方案中学习？', category: 'problem_solving' },

  // === Information & Knowledge (信息与知识) - INTP 特色 ===
  { question: '你如何过滤海量信息找到有价值的？', category: 'information' },
  { question: '信息过载如何影响你的决策？', category: 'information' },
  { question: '什么是你的信息获取习惯？', category: 'information' },
  { question: '你如何组织和存储知识？', category: 'information' },
  { question: '什么是你的知识管理系统？', category: 'information' },
  { question: '如何区分信号和噪音？', category: 'information' },
  { question: '你如何验证信息的可靠性？', category: 'information' },
  { question: '什么信息你消费太多？太少？', category: 'information' },
  { question: '你的信息饮食健康吗？', category: 'information' },
  { question: '知识的半衰期对你意味着什么？', category: 'information' },
  { question: '什么是你希望能更快获取的信息？', category: 'information' },
  { question: '你如何在信息和理解之间建立桥梁？', category: 'information' },
  { question: '什么是你的"第二大脑"系统？', category: 'information' },
  { question: '你如何处理相互矛盾的信息源？', category: 'information' },
  { question: '知识的网络效应如何影响你的学习？', category: 'information' },

  // === Complexity & Emergence (复杂性与涌现) - INTP 特色 ===
  { question: '简单规则如何产生复杂行为？', category: 'complexity' },
  { question: '什么是你见过的最令人惊讶的涌现现象？', category: 'complexity' },
  { question: '混沌理论如何影响你对预测的看法？', category: 'complexity' },
  { question: '什么是复杂而不是复杂化？', category: 'complexity' },
  { question: '你如何在复杂系统中寻找杠杆点？', category: 'complexity' },
  { question: '什么看似简单的事物实际上极其复杂？', category: 'complexity' },
  { question: '涌现意识的本质是什么？', category: 'complexity' },
  { question: '蝴蝶效应如何影响你的长期规划？', category: 'complexity' },
  { question: '复杂性的边缘是创新的温床吗？', category: 'complexity' },
  { question: '你如何处理非线性关系？', category: 'complexity' },
  { question: '什么是不可还原的复杂性？', category: 'complexity' },
  { question: '整体如何大于部分之和？', category: 'complexity' },
  { question: '你如何在复杂性中保持清晰的思维？', category: 'complexity' },
  { question: '什么是你理解复杂系统的关键洞察？', category: 'complexity' },
  { question: '简化和过度简化的界限在哪里？', category: 'complexity' },

  // === Analogies & Connections (类比与连接) - INTP 特色 ===
  { question: '什么是你最喜欢的跨领域类比？', category: 'analogy' },
  { question: '你如何在看似无关的事物间发现联系？', category: 'analogy' },
  { question: '什么类比曾经帮你理解一个难题？', category: 'analogy' },
  { question: '不同领域的什么概念可以相互借鉴？', category: 'analogy' },
  { question: '你生活的什么方面可以用编程类比解释？', category: 'analogy' },
  { question: '自然界的什么现象可以类比人类社会？', category: 'analogy' },
  { question: '什么是危险的类比？', category: 'analogy' },
  { question: '你如何判断一个类比是否恰当？', category: 'analogy' },
  { question: '什么是你创造的最有用的类比？', category: 'analogy' },
  { question: '模式识别如何帮助你理解新领域？', category: 'analogy' },
  { question: '什么是你领域中被低估的跨学科连接？', category: 'analogy' },
  { question: '如何用物理学原理解释社会现象？', category: 'analogy' },
  { question: '什么生物学概念可以应用于组织管理？', category: 'analogy' },
  { question: '你如何用旧知识理解新概念？', category: 'analogy' },
  { question: '什么是你最近发现的意外联系？', category: 'analogy' },

  // === Existence & Being (存在与存有) - INTP 特色 ===
  { question: '为什么存在"某物"而不是"虚无"？', category: 'existence' },
  { question: '你如何定义"存在"？', category: 'existence' },
  { question: '虚拟实体算不算"存在"？', category: 'existence' },
  { question: '数字存在吗？它们存在于哪里？', category: 'existence' },
  { question: '过去还存在吗？未来存在吗？', category: 'existence' },
  { question: '你的存在对宇宙意味着什么？', category: 'existence' },
  { question: '如果没有观察者，宇宙还存在吗？', category: 'existence' },
  { question: '潜在性和实在性有什么区别？', category: 'existence' },
  { question: '你如何处理存在的偶然性？', category: 'existence' },
  { question: '什么给了你的存在以意义？', category: 'existence' },
  { question: '存在先于本质，还是本质先于存在？', category: 'existence' },
  { question: '你如何面对终极的虚无？', category: 'existence' },
  { question: '短暂的存在和永恒的存在哪个更有价值？', category: 'existence' },
  { question: '你的存在如何影响他人的存在？', category: 'existence' },
  { question: '存在本身是否需要理由？', category: 'existence' },

  // === Innovation & Progress (创新与进步) - INTP 特色 ===
  { question: '什么阻碍了你所在领域的创新？', category: 'innovation' },
  { question: '最伟大的创新来自哪里？', category: 'innovation' },
  { question: '如何平衡改进现有方案和寻找全新方案？', category: 'innovation' },
  { question: '什么"不可能"的事情你认为最终会实现？', category: 'innovation' },
  { question: '创新需要什么样的环境？', category: 'innovation' },
  { question: '什么是被忽视的低悬果实（容易实现的创新）？', category: 'innovation' },
  { question: '进步是线性的还是突破性的？', category: 'innovation' },
  { question: '什么创新被过早放弃了？', category: 'innovation' },
  { question: '你如何培养创新思维？', category: 'innovation' },
  { question: '什么是你想要解决但还没有好方案的问题？', category: 'innovation' },
  { question: '范式转换是如何发生的？', category: 'innovation' },
  { question: '什么是你所在领域的"从0到1"机会？', category: 'innovation' },
  { question: '传统智慧的哪些部分需要被挑战？', category: 'innovation' },
  { question: '你如何区分真正的创新和噱头？', category: 'innovation' },
  { question: '什么资源或技术的组合可能产生突破？', category: 'innovation' },
]

export const dailyQuestionRouter = createTRPCRouter({
  // Initialize questions in database (run once or force reseed)
  seedQuestions: publicProcedure
    .input(z.object({ force: z.boolean().default(false) }).optional())
    .mutation(async ({ ctx, input }) => {
      const force = input?.force ?? false
      const existingCount = await ctx.prisma.dailyQuestion.count()

      if (force) {
        // Delete related records first (foreign key constraints)
        await ctx.prisma.questionAnswer.deleteMany()
        await ctx.prisma.userDailyQuestion.deleteMany()
        // Delete all existing questions and reseed
        await ctx.prisma.dailyQuestion.deleteMany()
        await ctx.prisma.dailyQuestion.createMany({
          data: SAMPLE_QUESTIONS,
        })
        return {
          message: 'Questions force reseeded successfully',
          previousCount: existingCount,
          newCount: SAMPLE_QUESTIONS.length,
        }
      }

      if (existingCount > 0) {
        // Try to add new questions (skip duplicates based on question text)
        const existingQuestions = await ctx.prisma.dailyQuestion.findMany({
          select: { question: true },
        })
        const existingSet = new Set(existingQuestions.map((q) => q.question))
        const newQuestions = SAMPLE_QUESTIONS.filter((q) => !existingSet.has(q.question))

        if (newQuestions.length === 0) {
          return { message: 'All questions already exist', count: existingCount }
        }

        await ctx.prisma.dailyQuestion.createMany({
          data: newQuestions,
          skipDuplicates: true,
        })

        return {
          message: `Added ${newQuestions.length} new questions`,
          previousCount: existingCount,
          newCount: existingCount + newQuestions.length,
        }
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
   *
   * 偏好系统：
   * - 当提供 userId 时，会获取用户的评分偏好
   * - 70% 概率基于用户偏好的类别生成问题
   * - 30% 概率随机类别（防止信息茧房）
   * - preferenceStrength 可调整偏好强度 (0-1)，默认 0.7
   */
  generateAIQuestions: publicProcedure
    .input(
      z.object({
        count: z.number().min(1).max(20).default(5),
        categories: z.array(z.string()).optional(),
        userId: z.string().optional(), // 可选：用于获取用户偏好
        preferenceStrength: z.number().min(0).max(1).default(0.7), // 偏好强度，防止信息茧房
        aiConfig: z
          .object({
            baseURL: z.string(),
            apiKey: z.string(),
            model: z.string().optional(),
            prompt: z.string().optional(),
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
        let categories = input.categories
        let preferenceApplied = false

        // 如果提供了 userId，获取用户偏好
        if (input.userId && !categories?.length) {
          // 获取用户高评分问题的类别分布
          const highRatedQuestions = await ctx.prisma.questionRating.findMany({
            where: {
              userId: input.userId,
              rating: { gte: 4 }, // 4-5 星的问题
            },
            include: {
              question: { select: { category: true, tag: true } },
            },
          })

          console.log(`[AI生成] 用户 ${input.userId} 有 ${highRatedQuestions.length} 个高评分问题`)

          if (highRatedQuestions.length >= 3) {
            // 至少有 3 个高评分问题才使用偏好
            // 统计类别权重
            const categoryWeights: Record<string, number> = {}
            for (const rating of highRatedQuestions) {
              const category = rating.question.category || 'reflection'
              // 权重 = 评分 (4 或 5)
              categoryWeights[category] = (categoryWeights[category] || 0) + rating.rating
            }

            // 按权重排序
            const sortedCategories = Object.entries(categoryWeights)
              .sort((a, b) => b[1] - a[1])
              .map(([cat]) => cat)

            console.log(`[AI生成] 类别权重: ${JSON.stringify(categoryWeights)}`)
            console.log(`[AI生成] 排序后类别: ${sortedCategories.join(', ')}`)

            // 根据 preferenceStrength 决定是否使用偏好
            // preferenceStrength = 0.7 意味着 70% 概率使用偏好类别
            const randomValue = Math.random()
            if (randomValue < input.preferenceStrength) {
              // 使用偏好：取前 3 个高权重类别
              categories = sortedCategories.slice(0, 3)
              preferenceApplied = true
              console.log(
                `[AI生成] 使用偏好类别 (${randomValue.toFixed(2)} < ${input.preferenceStrength}): ${categories.join(', ')}`
              )
            } else {
              // 30% 概率：随机探索，不限制类别（防止信息茧房）
              categories = undefined
              console.log(
                `[AI生成] 随机探索模式 (${randomValue.toFixed(2)} >= ${input.preferenceStrength})`
              )
            }
          } else {
            console.log('[AI生成] 高评分问题不足3个，跳过偏好')
          }
        }

        // 使用 AI 生成问题，传入是否为偏好模式
        const generatedQuestions = await aiService.generateQuestions(
          input.count,
          categories,
          preferenceApplied // 告诉 AI 这是用户偏好的类别
        )

        // 逐个创建问题到数据库，这样可以获取到创建的问题 ID
        const createdQuestions = []
        for (const q of generatedQuestions) {
          // 先检查是否已存在相同问题（避免重复）
          const existing = await ctx.prisma.dailyQuestion.findFirst({
            where: { question: q.question },
          })

          if (existing) {
            createdQuestions.push(existing)
          } else {
            const created = await ctx.prisma.dailyQuestion.create({
              data: {
                question: q.question,
                category: q.category || null,
                tag: q.tag || null,
              },
            })
            createdQuestions.push(created)
          }
        }

        return {
          success: true,
          count: createdQuestions.length,
          questions: createdQuestions, // 返回包含 ID 的完整问题记录
          preferenceApplied, // 是否应用了用户偏好
          usedCategories: categories, // 实际使用的类别
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
            baseURL: z.string(),
            apiKey: z.string(),
            model: z.string().optional(),
            prompt: z.string().optional(),
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
          baseURL: z.string(),
          apiKey: z.string(),
          model: z.string().optional(),
          prompt: z.string().optional(),
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
          baseURL: input.aiConfig.baseURL,
        }
      }
    }),

  // ============================================
  // Question Rating System
  // ============================================

  /**
   * Rate a question (1-5 stars)
   * Creates or updates the user's rating for a question
   */
  rateQuestion: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
        rating: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.questionRating.upsert({
        where: {
          userId_questionId: {
            userId: input.userId,
            questionId: input.questionId,
          },
        },
        create: {
          userId: input.userId,
          questionId: input.questionId,
          rating: input.rating,
        },
        update: {
          rating: input.rating,
        },
        include: {
          question: true,
        },
      })
      return result
    }),

  /**
   * Get user's rating for a specific question
   */
  getQuestionRating: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        questionId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const rating = await ctx.prisma.questionRating.findUnique({
        where: {
          userId_questionId: {
            userId: input.userId,
            questionId: input.questionId,
          },
        },
      })
      return rating
    }),

  /**
   * Get user's rating history
   */
  getUserRatings: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const ratings = await ctx.prisma.questionRating.findMany({
        where: { userId: input.userId },
        include: {
          question: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: input.limit,
      })
      return ratings
    }),

  /**
   * Get user's preference stats (tag distribution from high-rated questions)
   */
  getUserPreferenceStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get questions rated 4 or 5 stars
      const highRatedQuestions = await ctx.prisma.questionRating.findMany({
        where: {
          userId: input.userId,
          rating: { gte: 4 },
        },
        include: {
          question: true,
        },
      })

      // Count tags
      const tagCounts: Record<string, number> = {}
      for (const rating of highRatedQuestions) {
        const tag = rating.question.tag || 'unknown'
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }

      // Calculate percentages
      const total = highRatedQuestions.length
      const tagStats = Object.entries(tagCounts).map(([tag, count]) => ({
        tag,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))

      // Sort by count descending
      tagStats.sort((a, b) => b.count - a.count)

      return {
        totalRated: total,
        tagStats,
      }
    }),

  /**
   * Update a question's tag (admin function)
   */
  updateQuestionTag: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        tag: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.prisma.dailyQuestion.update({
        where: { id: input.questionId },
        data: { tag: input.tag },
      })
      return result
    }),

  /**
   * Batch update question tags
   */
  batchUpdateQuestionTags: publicProcedure
    .input(
      z.object({
        updates: z.array(
          z.object({
            questionId: z.string(),
            tag: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const results = await Promise.all(
        input.updates.map((update) =>
          ctx.prisma.dailyQuestion.update({
            where: { id: update.questionId },
            data: { tag: update.tag },
          })
        )
      )
      return { updated: results.length }
    }),

  /**
   * Get recommended question based on user preferences
   * 60% preference-based, 40% random (anti-filter-bubble)
   */
  getRecommendedQuestion: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get recently answered question IDs to avoid repetition
      const recentAnswers = await ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: { questionId: true },
      })
      const excludeIds = recentAnswers.map((a) => a.questionId)

      // Get user's high-rated question tags
      const highRatedQuestions = await ctx.prisma.questionRating.findMany({
        where: {
          userId: input.userId,
          rating: { gte: 4 },
        },
        include: {
          question: { select: { tag: true } },
        },
      })

      // Calculate tag weights
      const tagWeights: Record<string, number> = {}
      for (const rating of highRatedQuestions) {
        const tag = rating.question.tag
        if (tag) {
          tagWeights[tag] = (tagWeights[tag] || 0) + rating.rating
        }
      }

      const preferredTags = Object.keys(tagWeights)

      // Decide: 60% preference, 40% random
      const usePreference = Math.random() < 0.6 && preferredTags.length > 0

      let question = null

      if (usePreference) {
        // Weighted random tag selection
        const totalWeight = Object.values(tagWeights).reduce((a, b) => a + b, 0)
        let random = Math.random() * totalWeight
        let selectedTag = preferredTags[0]

        for (const tag of preferredTags) {
          random -= tagWeights[tag] || 0
          if (random <= 0) {
            selectedTag = tag
            break
          }
        }

        // Get questions with selected tag
        const tagQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            tag: selectedTag,
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        if (tagQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * tagQuestions.length)
          question = tagQuestions[randomIndex]
        }
      }

      // Fallback to random question (or 40% random path)
      if (!question) {
        const availableQuestions = await ctx.prisma.dailyQuestion.findMany({
          where: {
            id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
          },
        })

        const questions =
          availableQuestions.length > 0
            ? availableQuestions
            : await ctx.prisma.dailyQuestion.findMany()

        if (questions.length > 0) {
          const randomIndex = Math.floor(Math.random() * questions.length)
          question = questions[randomIndex]
        }
      }

      return {
        question,
        source: usePreference && question ? 'preference' : 'random',
      }
    }),

  // ============================================
  // Review & Statistics APIs
  // ============================================

  /**
   * Get streak statistics (consecutive days answered)
   */
  getStreakStats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get all unique answer dates for the user
      const answers = await ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        select: { date: true },
        orderBy: { date: 'desc' },
      })

      if (answers.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          lastAnswerDate: null,
          weeklyActivity: [false, false, false, false, false, false, false],
          totalAnsweredDays: 0,
        }
      }

      // Get unique dates (normalize to date only)
      const uniqueDates = [...new Set(answers.map((a) => a.date.toISOString().split('T')[0]))]
        .filter((d): d is string => d !== undefined)
        .map((d) => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime())

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Calculate current streak
      let currentStreak = 0
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      // Check if answered today or yesterday to start counting
      const latestDate = uniqueDates[0]
      if (latestDate) {
        const latestDateNorm = new Date(latestDate)
        latestDateNorm.setHours(0, 0, 0, 0)

        if (
          latestDateNorm.getTime() === today.getTime() ||
          latestDateNorm.getTime() === yesterday.getTime()
        ) {
          currentStreak = 1
          const checkDate = new Date(latestDateNorm)
          checkDate.setDate(checkDate.getDate() - 1)

          for (let i = 1; i < uniqueDates.length; i++) {
            const d = new Date(uniqueDates[i] as Date)
            d.setHours(0, 0, 0, 0)
            if (d.getTime() === checkDate.getTime()) {
              currentStreak++
              checkDate.setDate(checkDate.getDate() - 1)
            } else {
              break
            }
          }
        }
      }

      // Calculate longest streak
      let longestStreak = 1
      let tempStreak = 1
      for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i] as Date)
        const prev = new Date(uniqueDates[i - 1] as Date)
        curr.setHours(0, 0, 0, 0)
        prev.setHours(0, 0, 0, 0)

        const diffDays = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 1
        }
      }

      // Calculate weekly activity (Mon-Sun, current week)
      const weekStart = new Date(today)
      const dayOfWeek = today.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      weekStart.setDate(weekStart.getDate() - daysToMonday)
      weekStart.setHours(0, 0, 0, 0)

      const weeklyActivity: boolean[] = []
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart)
        checkDate.setDate(checkDate.getDate() + i)
        const dateStr = checkDate.toISOString().split('T')[0]
        weeklyActivity.push(uniqueDates.some((d) => d.toISOString().split('T')[0] === dateStr))
      }

      return {
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastAnswerDate: uniqueDates[0] || null,
        weeklyActivity,
        totalAnsweredDays: uniqueDates.length,
      }
    }),

  /**
   * Get dashboard summary (compact stats for daily-question page)
   */
  getDashboardSummary: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get this week's date range (Mon-Sun)
      const weekStart = new Date(today)
      const dayOfWeek = today.getDay()
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      weekStart.setDate(weekStart.getDate() - daysToMonday)
      weekStart.setHours(0, 0, 0, 0)

      // Count answered days this week
      const weekAnswers = await ctx.prisma.questionAnswer.findMany({
        where: {
          userId: input.userId,
          date: { gte: weekStart },
        },
        select: { date: true },
      })

      const uniqueWeekDays = new Set(weekAnswers.map((a) => a.date.toISOString().split('T')[0]))

      // Check if answered today
      const todayAnswer = await ctx.prisma.questionAnswer.findFirst({
        where: {
          userId: input.userId,
          date: today,
        },
      })

      // Get streak stats
      const streakData = await ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        select: { date: true },
        orderBy: { date: 'desc' },
      })

      let currentStreak = 0
      if (streakData.length > 0) {
        const uniqueDates = [...new Set(streakData.map((a) => a.date.toISOString().split('T')[0]))]
          .filter((d): d is string => d !== undefined)
          .map((d) => new Date(d))
          .sort((a, b) => b.getTime() - a.getTime())

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const latestDate = uniqueDates[0]
        if (latestDate) {
          const latestDateNorm = new Date(latestDate)
          latestDateNorm.setHours(0, 0, 0, 0)

          if (
            latestDateNorm.getTime() === today.getTime() ||
            latestDateNorm.getTime() === yesterday.getTime()
          ) {
            currentStreak = 1
            const checkDate = new Date(latestDateNorm)
            checkDate.setDate(checkDate.getDate() - 1)

            for (let i = 1; i < uniqueDates.length; i++) {
              const d = new Date(uniqueDates[i] as Date)
              d.setHours(0, 0, 0, 0)
              if (d.getTime() === checkDate.getTime()) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1)
              } else {
                break
              }
            }
          }
        }
      }

      // Get top 3 preferred tags
      const highRatedQuestions = await ctx.prisma.questionRating.findMany({
        where: {
          userId: input.userId,
          rating: { gte: 4 },
        },
        include: {
          question: { select: { category: true } },
        },
      })

      const tagCounts: Record<string, number> = {}
      for (const rating of highRatedQuestions) {
        const tag = rating.question.category || 'unknown'
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag, count]) => ({ tag, count }))

      return {
        weeklyProgress: {
          answered: uniqueWeekDays.size,
          total: 7,
        },
        currentStreak,
        topTags,
        todayAnswered: !!todayAnswer,
      }
    }),

  /**
   * Get review statistics for a period (week/month)
   */
  getReviewStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        period: z.enum(['week', 'month']),
        date: z.string().optional(), // ISO date string, defaults to today
      })
    )
    .query(async ({ ctx, input }) => {
      const baseDate = input.date ? new Date(input.date) : new Date()
      baseDate.setHours(0, 0, 0, 0)

      let startDate: Date
      let endDate: Date = new Date(baseDate)
      endDate.setHours(23, 59, 59, 999)

      if (input.period === 'week') {
        // Get current week (Mon-Sun)
        startDate = new Date(baseDate)
        const dayOfWeek = baseDate.getDay()
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate.setDate(startDate.getDate() - daysToMonday)
        startDate.setHours(0, 0, 0, 0)
      } else {
        // Get current month
        startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
        endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999)
      }

      // Get all answers in the period
      const answers = await ctx.prisma.questionAnswer.findMany({
        where: {
          userId: input.userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          question: true,
        },
        orderBy: { date: 'desc' },
      })

      // Get ratings for answered questions
      const questionIds = [...new Set(answers.map((a) => a.questionId))]
      const ratings = await ctx.prisma.questionRating.findMany({
        where: {
          userId: input.userId,
          questionId: { in: questionIds },
        },
      })
      const ratingMap = new Map(ratings.map((r) => [r.questionId, r.rating]))

      // Calculate unique answered days
      const uniqueDays = new Set(answers.map((a) => a.date.toISOString().split('T')[0]))

      // Calculate tag distribution
      const tagCounts: Record<string, number> = {}
      for (const answer of answers) {
        const tag = answer.question.category || 'unknown'
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }

      const totalAnswers = answers.length
      const tagDistribution = Object.entries(tagCounts)
        .map(([tag, count]) => ({
          tag,
          count,
          percentage: totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)

      // Get high-rated questions (4-5 stars)
      const highRatedQuestions = answers
        .filter((a) => (ratingMap.get(a.questionId) || 0) >= 4)
        .map((a) => ({
          id: a.id,
          question: a.question.question,
          answer: a.answer,
          rating: ratingMap.get(a.questionId) || 0,
          date: a.date,
          category: a.question.category,
        }))

      // Prepare answer list with ratings
      const answersWithRatings = answers.map((a) => ({
        id: a.id,
        question: a.question.question,
        questionId: a.questionId,
        answer: a.answer,
        date: a.date,
        rating: ratingMap.get(a.questionId) || null,
        category: a.question.category,
      }))

      return {
        period: input.period,
        startDate,
        endDate,
        totalAnswers,
        answeredDays: uniqueDays.size,
        avgAnswersPerDay:
          uniqueDays.size > 0 ? Math.round((totalAnswers / uniqueDays.size) * 10) / 10 : 0,
        tagDistribution,
        highRatedQuestions,
        answers: answersWithRatings,
      }
    }),

  /**
   * Get growth comparison - same category questions answered over time
   */
  getGrowthComparison: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        category: z.string().optional(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get all answers with their questions
      const answers = await ctx.prisma.questionAnswer.findMany({
        where: { userId: input.userId },
        include: {
          question: true,
        },
        orderBy: { date: 'asc' },
      })

      if (answers.length === 0) {
        return { comparisons: [] }
      }

      // Group by category
      const byCategory: Record<string, typeof answers> = {}
      for (const answer of answers) {
        const category = answer.question.category || 'unknown'
        if (input.category && category !== input.category) continue
        if (!byCategory[category]) {
          byCategory[category] = []
        }
        byCategory[category].push(answer)
      }

      // Find categories with multiple answers for comparison
      const comparisons = Object.entries(byCategory)
        .filter(([_, items]) => items.length >= 2)
        .slice(0, input.limit)
        .map(([category, items]) => {
          // Get first and last answers for comparison
          const sortedItems = items.sort((a, b) => a.date.getTime() - b.date.getTime())
          return {
            category,
            totalAnswers: items.length,
            firstAnswer: {
              question: sortedItems[0]?.question.question,
              answer: sortedItems[0]?.answer,
              date: sortedItems[0]?.date,
            },
            latestAnswer: {
              question: sortedItems[sortedItems.length - 1]?.question.question,
              answer: sortedItems[sortedItems.length - 1]?.answer,
              date: sortedItems[sortedItems.length - 1]?.date,
            },
            allAnswers: sortedItems.map((a) => ({
              question: a.question.question,
              answer: a.answer,
              date: a.date,
            })),
          }
        })

      return { comparisons }
    }),
})
