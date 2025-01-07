import { useEffect, useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';
import { ApFlagId, Permission } from '@activepieces/shared';

import { DashboardContainer } from '../components/dashboard-container';

import { PageTitle } from '@/app/components/page-title';
import AuthenticatePage from '@/app/routes/authenticate';
import { RoutePermissionGuard } from '@/app/router/permission-guard';
import { FlowsPage } from '@/app/routes/flows';
import { FlowBuilderPage } from '@/app/routes/flows/id';
import { FlowRunsPage } from '@/app/routes/runs';
import { FlowRunPage } from '@/app/routes/runs/id';
import { AppConnectionsPage } from '@/app/routes/connections';


const routes = [
  {
    path: '/authenticate',
    element: <AuthenticatePage />,
  },{
    path: '/projects/:projectId/flows',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="Flows">
            <FlowsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  },
  {
    path: '/projects/:projectId/flows/:flowId',
    element: (
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="Builder">
            <FlowBuilderPage />
          </PageTitle>
        </RoutePermissionGuard>
    ),
  },
  {
    path: '/projects/:projectId/runs',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Runs">
            <FlowRunsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  },
  {
    path: '/projects/:projectId/runs/:runId',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Flow Run">
            <FlowRunPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer> 
    ),
  },{
    path: '/projects/:projectId/connections',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_APP_CONNECTION}>
          <PageTitle title="Connections">
            <AppConnectionsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }
];
const ApRouter = () => {
  const router = createHashRouter(routes);

  return <RouterProvider router={router}></RouterProvider>;
};

export { ApRouter };
