# Query Performance Monitoring

## Overview

The `useQueryPerformance` hook provides real-time performance monitoring for TanStack Query requests. It automatically tracks query execution times and logs performance metrics to the console in development mode.

## Features

- ✅ Automatic query timing
- ✅ Console logging with color-coded output
- ✅ Configurable logging thresholds
- ✅ Slow query warnings (> 1000ms)
- ✅ Success/error status tracking
- ✅ Performance statistics aggregation
- ✅ Global performance monitor utility

## Usage

### Basic Usage

```typescript
import { useQueryPerformance } from '@/client/hooks/use-query-performance'

const MyComponent = () => {
  const queryResult = useQuery({
    queryKey: ['my-data'],
    queryFn: fetchMyData,
  })

  // Add performance monitoring
  useQueryPerformance(queryResult, 'my-data-query')

  // ... rest of component
}
```

### With Configuration

```typescript
// Only log if query takes more than 100ms
useQueryPerformance(queryResult, 'slow-query-check', {
  threshold: 100,
  enabled: true,
})

// Disable in production (default: enabled only in development)
useQueryPerformance(queryResult, 'my-query', {
  enabled: process.env.NODE_ENV === 'development',
})
```

### Current Implementation

Performance monitoring is currently tracking:

1. **Status Column Queries** (5 queries)
   - `tasks-by-status-todo`
   - `tasks-by-status-in_progress`
   - `tasks-by-status-completed`
   - `tasks-by-status-blocked`
   - `tasks-by-status-cancelled`
   - Threshold: 100ms

2. **Summary Count Queries** (5 queries)
   - `summary-count-todo`
   - `summary-count-in_progress`
   - `summary-count-completed`
   - `summary-count-blocked`
   - `summary-count-cancelled`
   - Threshold: 50ms

## Console Output

### Success Example

```
✅ Query Performance: tasks-by-status-todo
Duration: 45ms
Status: success
Timestamp: 2025-11-11T10:30:15.123Z
```

### Slow Query Warning

```
⚠️ Slow query detected: tasks-by-status-completed took 1234ms
```

## Global Performance Monitor

In development mode, a global `queryPerformance` utility is available in the browser console.

### View Statistics

```javascript
// Get stats for all queries
window.queryPerformance.printStats()

// Get stats for specific query
window.queryPerformance.printStats('tasks-by-status-todo')

// Get raw stats object
window.queryPerformance.getStats('summary-count-completed')
// Returns:
// {
//   count: 10,
//   avg: 42,
//   min: 28,
//   max: 89,
//   successCount: 10,
//   errorCount: 0,
//   successRate: '100.0%'
// }

// Clear collected data
window.queryPerformance.clear()
```

## Performance Targets

Based on database indexing recommendations:

- **With indexes**: 15-40ms total for 5 parallel queries ✅
- **Without indexes**: 200-1000ms+ ❌

### Expected Times:

- Summary counts (pageSize: 1): < 50ms
- Status column queries (pageSize: 50): < 100ms
- Slow query warning: > 1000ms

## Optimization Tips

1. **Add Database Indexes**

   ```sql
   CREATE INDEX tasks_user_status_idx ON tasks (userId, status, deletedAt);
   CREATE INDEX tasks_user_status_sort_idx ON tasks (userId, status, dueDate, priority, effort);
   ```

2. **Monitor Threshold Violations**
   - Queries consistently exceeding thresholds indicate indexing or query optimization needs

3. **Check Statistics Regularly**
   - Use `window.queryPerformance.printStats()` to identify slow queries

4. **Adjust Page Sizes**
   - Reduce `pageSize` if queries are slow
   - Current: 50 for columns, 1 for counts

## Troubleshooting

### Queries Not Being Logged

- Check `enabled` option (default: development only)
- Verify query is actually executing (check `isFetching` state)
- Check threshold setting (queries faster than threshold won't log)

### Performance Issues

If seeing slow queries:

1. Check database indexes (most common issue)
2. Verify network conditions
3. Check server-side query optimization
4. Consider pagination adjustments
5. Review data volume per query

## Development vs Production

- **Development**: Logging enabled by default
- **Production**: Logging disabled by default (configurable)
- **Console logging**: Only in development
- **Performance tracking**: Available in both environments

## Future Enhancements

Potential additions:

- [ ] Performance metrics export
- [ ] Integration with monitoring services (e.g., Sentry, DataDog)
- [ ] React DevTools panel
- [ ] Performance regression alerts
- [ ] Automatic slow query reports
