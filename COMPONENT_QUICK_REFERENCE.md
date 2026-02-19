# 🎨 COMPONENT QUICK REFERENCE

**Quick copy-paste examples for all new components**

---

## 1. SKELETON LOADER

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Single line
<Skeleton className="h-4 w-full" />

// Multiple lines
<div className="space-y-2">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-5/6" />
  <Skeleton className="h-4 w-4/6" />
</div>

// Card skeleton
<div className="space-y-3">
  <Skeleton className="h-48 w-full" />
  <Skeleton className="h-6 w-3/4" />
  <Skeleton className="h-4 w-full" />
</div>
```

---

## 2. ALERT DIALOG

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your project.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 3. EMPTY STATE

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="No projects yet"
  description="Start by uploading your first project to get started"
  action={{
    label: "Upload Project",
    onClick: () => router.push('/projects/new')
  }}
/>
```

---

## 4. PAGINATION

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        href="#" 
        onClick={() => setPage(page - 1)}
      />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext 
        href="#"
        onClick={() => setPage(page + 1)}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

---

## 5. LOADING SPINNER

```tsx
import { LoadingSpinner, PageLoader, FullPageLoader } from '@/components/ui/loading-spinner';

// Inline spinner
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" text="Loading..." />

// Page section
<PageLoader text="Loading projects..." />

// Full page overlay
<FullPageLoader text="Processing payment..." />
```

---

## 6. ERROR BOUNDARY

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary';

// Wrap your component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// In layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

---

## 7. STAT CARD

```tsx
import { StatCard, StatCardSkeleton } from '@/components/ui/stat-card';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

// With trend
<StatCard
  title="Total Revenue"
  value="₹45,231"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
  description="From 156 sales"
/>

// Without trend
<StatCard
  title="Active Projects"
  value="24"
  icon={Package}
  description="Currently live"
/>

// Loading state
<StatCardSkeleton />

// Grid of stat cards
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard title="Revenue" value="₹45K" icon={DollarSign} />
  <StatCard title="Sales" value="156" icon={ShoppingCart} />
  <StatCard title="Projects" value="24" icon={Package} />
  <StatCard title="Balance" value="₹12K" icon={TrendingUp} />
</div>
```

---

## 8. PROJECT CARD SKELETON

```tsx
import { ProjectCardSkeleton, ProjectCardSkeletonGrid } from '@/components/ui/project-card-skeleton';

// Single skeleton
<ProjectCardSkeleton />

// Grid of skeletons
<ProjectCardSkeletonGrid count={6} />

// With conditional rendering
{loading ? (
  <ProjectCardSkeletonGrid count={6} />
) : (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {projects.map(project => <ProjectCard key={project.id} {...project} />)}
  </div>
)}
```

---

## 9. TABLE

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

<Table>
  <TableCaption>A list of your recent orders</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Order ID</TableHead>
      <TableHead>Project</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {orders.map((order) => (
      <TableRow key={order.id}>
        <TableCell className="font-medium">{order.orderNumber}</TableCell>
        <TableCell>{order.project.title}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        <TableCell className="text-right">₹{order.amount}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 10. USE CONFIRM DIALOG HOOK

```tsx
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

function MyComponent() {
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Project?',
      description: 'This will permanently delete the project. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      // Proceed with deletion
      await deleteProject();
    }
  };

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Approve Project?',
      description: 'This will make the project live on the marketplace.',
      confirmText: 'Approve',
      cancelText: 'Cancel',
      variant: 'default',
    });

    if (confirmed) {
      await approveProject();
    }
  };

  return (
    <>
      <Button onClick={handleDelete}>Delete</Button>
      <Button onClick={handleApprove}>Approve</Button>
      <ConfirmDialog />
    </>
  );
}
```

---

## 🎯 COMMON PATTERNS

### Loading State Pattern
```tsx
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

if (loading) {
  return <ProjectCardSkeletonGrid count={6} />;
}

if (data.length === 0) {
  return <EmptyState icon={Package} title="No data" description="..." />;
}

return <DataDisplay data={data} />;
```

### Error Handling Pattern
```tsx
<ErrorBoundary>
  <Suspense fallback={<PageLoader />}>
    <YourComponent />
  </Suspense>
</ErrorBoundary>
```

### Dashboard Stats Pattern
```tsx
{loading ? (
  <div className="grid md:grid-cols-4 gap-6">
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
  </div>
) : (
  <div className="grid md:grid-cols-4 gap-6">
    <StatCard title="Revenue" value={revenue} icon={DollarSign} />
    <StatCard title="Sales" value={sales} icon={ShoppingCart} />
    <StatCard title="Projects" value={projects} icon={Package} />
    <StatCard title="Balance" value={balance} icon={TrendingUp} />
  </div>
)}
```

### Confirmation Pattern
```tsx
const { confirm, ConfirmDialog } = useConfirmDialog();

const handleAction = async () => {
  const confirmed = await confirm({
    title: 'Confirm Action',
    description: 'Are you sure?',
    variant: 'destructive',
  });

  if (confirmed) {
    // Do action
  }
};

return (
  <>
    <Button onClick={handleAction}>Action</Button>
    <ConfirmDialog />
  </>
);
```

---

## 📝 TIPS

### Skeleton Loaders
- Match the skeleton to your actual content layout
- Use same spacing and sizing
- Add multiple skeletons for lists

### Empty States
- Always provide an action button
- Use relevant icons
- Keep descriptions helpful and short

### Stat Cards
- Use consistent icons across dashboard
- Add trends when available
- Keep titles short (2-3 words)

### Confirmations
- Use 'destructive' variant for delete actions
- Keep descriptions clear about consequences
- Use action-specific button text

### Error Boundaries
- Wrap entire app or major sections
- Provide helpful error messages
- Always offer a way to recover

---

**🎨 Copy, paste, and customize these components for your needs!**
