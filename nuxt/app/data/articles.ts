// Developed by Mateo Garcia Carreno

// Internal imports
import type { ArticleInterface } from '../interfaces/ArticleInterface';

export const articles: ArticleInterface[] = [
  {
    id: 1,
    title: 'Reading the Sprint Completion Chart',
    summary:
      'What the committed and completed bars on the Trazo dashboard tell you about a team, and what they do not.',
    paragraphs: [
      'Every sprint on the Trazo dashboard gets two bars side by side. The grey bar is the commitment: the story points of every task scheduled into the sprint. The green bar is what was delivered: the points of the tasks that reached Done. Neither number is typed in by hand; both are summed from the tasks every time the chart loads, so they can never drift away from the work they describe.',
      'The gap between the two bars is the interesting part. A completed sprint where the bars match means the team planned exactly what it could finish. A steady gap means the team keeps over-committing, and the honest fix is to schedule less, not to work longer. A gap that only appears in the active sprint is normal: that sprint has not had its chance to finish yet.',
      'Read the chart left to right, not bar by bar. One bad sprint is noise; three sprints whose green bars keep shrinking is a trend worth a conversation at the next retrospective.',
    ],
    author: 'Trazo Team',
    category: 'Sprints',
    publishedAt: '2026-09-08',
  },
  {
    id: 2,
    title: 'Why Trazo Estimates in Story Points',
    summary:
      'Hours look precise and turn out wrong. Relative sizing in story points is what makes the velocity chart worth reading.',
    paragraphs: [
      'When a task is created in Trazo, it gets story points rather than an hour estimate. A story point is not a unit of time. It is a size relative to other tasks: a 5 is roughly twice the effort of a 3, whoever picks it up and whatever else happens that week.',
      'Relative sizes hold up better than hours because people are good at comparing two pieces of work and bad at predicting their own calendar. Once a team has sized a few sprints of work, the completed points per sprint settle into a range, and that range is the velocity the dashboard charts.',
      'Two habits keep the numbers useful. Size a task when it is created, not when it is finished, so the estimate is a real prediction. And never re-size a task after the fact to make a sprint look better: the chart is only as honest as the points behind it.',
    ],
    author: 'Trazo Team',
    category: 'Estimation',
    publishedAt: '2026-09-22',
  },
  {
    id: 3,
    title: 'Spotting an Overloaded Teammate',
    summary:
      'How the "Open tasks by assignee" panel shows who is carrying too much before it turns into a missed deadline.',
    paragraphs: [
      "Administrators see a panel on the Trazo dashboard called Open tasks by assignee. It counts every unfinished task in the selected project for each of the project's users, sorted from the busiest person down. Users with nothing open still get a row, because an idle teammate is exactly what this chart should reveal.",
      'A tall bar is a question, not a verdict. Five open tasks of one point each is a different week from five tasks of eight points each, so open the task list and look at the sizes before reassigning anything. The Unassigned bar matters too: work nobody owns is work nobody is doing.',
      'The panel is only shown to administrators. Ranking colleagues by workload is a tool for whoever staffs the project; members see a table of their own assigned tasks in the same spot instead, ordered by what is due next.',
    ],
    author: 'Trazo Team',
    category: 'Team',
    publishedAt: '2026-10-06',
  },
];
