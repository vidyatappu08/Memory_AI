import { saveMemory } from './memoryService'
import { supabase } from './supabase'

export const demoMemories = [
  {
    title: 'Product Meeting - May 15 2025',
    sourceType: 'chat',
    content: `Rahul suggested using blue color for the payment button instead of green. He said blue builds more trust with users.
Sarah owns the login page redesign task. Her deadline is June 1st 2025.
We decided to postpone the dark mode feature to next sprint due to time constraints.
John reported a critical bug where users cannot reset their password on mobile devices.
The team agreed to do daily standups at 10am starting next week.
Priya will handle the onboarding flow redesign. She needs design assets from Rahul by Friday.`
  },
  {
    title: 'Sprint Planning - May 10 2025',
    sourceType: 'chat',
    content: `Sprint goal: Launch the new dashboard by end of May.
Tasks assigned this sprint:
- Rahul: Payment page UI redesign, due May 20
- Sarah: Login page and forgot password flow, due June 1
- John: Fix mobile password reset bug, due May 17
- Priya: Onboarding flow, due May 25
Team capacity this sprint is 80 percent due to holidays.
We decided to cut the notification feature from this sprint and move it to backlog.
Budget for third party tools approved at 500 dollars per month.`
  },
  {
    title: 'Design Review - May 12 2025',
    sourceType: 'pdf',
    content: `Design decisions made today:
Primary color changed from green to blue across all CTAs.
Font size increased to 16px for better readability on mobile.
Rahul presented three options for the payment screen. Option 2 was selected by the team.
The checkout flow will be reduced from 5 steps to 3 steps.
Sarah raised concern about accessibility on the login page. We agreed to add ARIA labels.
Mobile first approach confirmed for all new features going forward.
Logo redesign postponed to Q3 2025.`
  },
  {
    title: 'Bug Report - May 14 2025',
    sourceType: 'note',
    content: `Critical bugs identified this week:
1. Password reset not working on iOS Safari - assigned to John, priority HIGH
2. Payment button not showing on Samsung Galaxy S21 - assigned to Rahul, priority HIGH
3. Login page crashes when email has special characters - assigned to Sarah, priority MEDIUM
4. Dashboard slow to load when user has more than 100 items - assigned to Priya, priority LOW
John estimated the password reset fix will take 2 days.
All critical bugs must be fixed before the May 30 release.`
  },
  {
    title: 'Client Call Notes - May 8 2025',
    sourceType: 'chat',
    content: `Call with Acme Corp client today.
They requested dark mode as a priority feature - noted for Q3.
Client is happy with current dashboard but wants export to PDF feature.
They have 500 users onboarded so far and expect to reach 2000 by August.
Follow up action: Send revised pricing proposal by May 12 - assigned to Rahul.
Client mentioned competitor app has better mobile experience - team to investigate.
Next call scheduled for June 5 2025.`
  }
]

export async function loadDemoData() {
  const { data: existing } = await supabase
    .from('memories')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    alert('Demo data already loaded!')
    return
  }

  for (const memory of demoMemories) {
    await saveMemory(memory.title, memory.content, memory.sourceType)
  }
}