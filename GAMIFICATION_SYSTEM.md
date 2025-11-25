# Segmena Insight - Gamification System

## Overview
Sistem gamification yang clean, profesional, dan tidak mengganggu UX untuk platform analisis data Segmena Insight. Dirancang untuk membantu user memahami fitur, meningkatkan eksplorasi segmen, serta meningkatkan retensi.

## Features

### 1. Progress & Milestones
- **Progress Bar** untuk tracking kemajuan user dalam berbagai aktivitas
- **Milestones** yang jelas:
  - Explored 5 Segments
  - Created First Insight Report
  - Compared 2 Segments
  - Used 3 Visualization Types
  - Applied Filters

### 2. Achievement Badges (Terkurasi)
Badges yang hanya muncul berdasarkan aktivitas analitik nyata:

| Badge | Description | Requirement |
|-------|-------------|-------------|
| **Data Explorer** | Explored 5 different customer segments | segmentsExplored >= 5 |
| **Insight Crafter** | Created your first insight report | insightsCreated >= 1 |
| **Trend Spotter** | Used 3 different visualization types | visualizationsUsed >= 3 |
| **Retention Analyst** | Compared 2 segments to find patterns | segmentsCompared >= 2 |

### 3. Guided Missions / Onboarding
4 mission onboarding untuk memandu user:
1. **Analyze Your First Segment** - Explore dan view details dari customer segment
2. **Compare Two Segments** - Gunakan comparison feature
3. **Save Your First Insight** - Create dan save insight report
4. **Apply Your First Filter** - Gunakan filters untuk refine data view

Setiap misi yang selesai memberikan:
- 50 points reward
- Visual feedback (toast notification)
- Progress tracking

### 4. Micro-interactions
- Smooth animations menggunakan Framer Motion
- Celebration animation saat unlock achievement
- Subtle transitions yang tidak mengganggu
- Hover effects pada cards

### 5. Weekly Streak (Optional)
- Track active days per week
- Ringan dan cocok untuk platform analitik profesional
- Display current streak dan longest streak
- Visual dengan fire icon (Flame)

## Components

### Core Components
```
src/
├── contexts/
│   └── GamificationContext.tsx          # State management & API calls
├── components/gamification/
│   ├── ProgressBar.tsx                   # Progress bars untuk milestones
│   ├── AchievementBadge.tsx              # Display achievement badges
│   ├── MissionCard.tsx                   # Guided mission cards
│   ├── StreakCounter.tsx                 # Weekly streak display
│   ├── CelebrationAnimation.tsx          # Micro-interaction animations
│   ├── GamificationDashboard.tsx         # Full dashboard dengan tabs
│   └── GamificationWidget.tsx            # Compact collapsible widget
└── hooks/
    └── useGamificationTracking.ts        # Auto-check achievements hook
```

### Database Schema
```sql
-- Main gamification profile
user_gamification (
  user_id, total_points, level,
  segments_explored, insights_created, segments_compared,
  visualizations_used, filters_applied,
  current_streak, longest_streak
)

-- Achievement tracking
user_achievements (
  user_id, achievement_key, achievement_name,
  achievement_description, unlocked_at
)

-- Mission tracking
user_missions (
  user_id, mission_key, mission_name,
  mission_description, is_completed, completed_at
)

-- Activity logging
user_activities (
  user_id, activity_type, activity_data, created_at
)
```

## Tracking System

### Automatic Activity Tracking
Activities are tracked automatically throughout the app:

| Activity | Trigger | Points | Location |
|----------|---------|--------|----------|
| `segment_explored` | Visit segment detail page | 10 | Segments.tsx |
| `insight_created` | Create insight report | 25 | - |
| `segments_compared` | Compare segments | 20 | - |
| `visualization_used` | View charts | 5 | Chart components |
| `filter_applied` | Apply data filters | 5 | - |

### Achievement Auto-Unlock
Sistem secara otomatis check achievement requirements setiap kali gamification data berubah menggunakan `useGamificationTracking` hook.

## Usage

### Initialize Gamification
Gamification provider sudah di-wrap di App level:
```tsx
<GamificationProvider>
  <App />
</GamificationProvider>
```

### Track Activity
```tsx
import { useGamification } from '@/contexts/GamificationContext';

const { trackActivity } = useGamification();

// Track when user explores a segment
trackActivity('segment_explored', { segment: 'Champions' });

// Track when user uses visualization
trackActivity('visualization_used', { chart: 'revenue_trend' });
```

### Complete Mission
```tsx
const { completeMission } = useGamification();

// Complete mission automatically
completeMission('analyze_first_segment');
```

### Display Widgets
```tsx
// Full dashboard (in dedicated page or section)
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
<GamificationDashboard />

// Compact widget (in dashboard header)
import { GamificationWidget } from '@/components/gamification/GamificationWidget';
<GamificationWidget />
```

## Design Principles

### 1. Professional & Clean
- Minimal, tidak seperti game
- Color palette mengikuti design system
- Subtle animations
- Glass morphism UI

### 2. Non-Intrusive
- Widget bisa di-collapse
- Tidak blocking user workflow
- Optional notifications
- Clean visual hierarchy

### 3. Data-Driven
- Semua achievements tied to real analytics activities
- No arbitrary gamification (like daily login streaks)
- Focus on feature discovery dan engagement
- Meaningful rewards

### 4. Accessible
- Clear progress indicators
- Descriptive labels
- Semantic HTML
- ARIA labels where needed

## Points System

| Action | Points |
|--------|--------|
| Explore segment | 10 |
| Use visualization | 5 |
| Apply filter | 5 |
| Compare segments | 20 |
| Create insight | 25 |
| Complete mission | 50 |

## Level System
- Level 1: 0-99 points
- Level 2: 100-299 points
- Level 3: 300-599 points
- Level 4: 600-999 points
- Level 5: 1000+ points

## Integration Points

### Dashboard
- Compact widget di header untuk quick overview
- Full gamification dashboard di bawah charts
- Progress tracking terintegrasi dengan analytics

### Segments Page
- Auto-track segment exploration
- Complete "analyze first segment" mission
- Unlock achievements berdasarkan exploration

### Charts
- Auto-track visualization usage
- Help unlock "Trend Spotter" achievement
- Encourage feature discovery

## Best Practices

1. **Don't Overwhelm Users**
   - Show gamification progressively
   - Start with onboarding missions
   - Gradually introduce achievements

2. **Make It Optional**
   - Widget can be collapsed
   - Not required for core functionality
   - Users can ignore if they want

3. **Celebrate Wins**
   - Show celebration animation for achievements
   - Toast notifications for milestones
   - Keep it subtle and professional

4. **Track Meaningfully**
   - Only track actions that matter
   - Don't gamify everything
   - Focus on feature adoption

## Future Enhancements

- Export achievements/progress as PDF
- Leaderboard (optional, for teams)
- Custom badges per workspace
- Integration with team collaboration features
- Progress comparison with similar users
- Personalized recommendations based on progress

## Security & Privacy

- All gamification data is user-scoped (RLS policies)
- No public leaderboards by default
- Activity tracking is anonymous
- Users can reset progress if needed

---

**Built with:** React, TypeScript, Supabase, Framer Motion, Tailwind CSS
**Design System:** Shadcn UI Components
**Database:** PostgreSQL (Supabase)
