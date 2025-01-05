import { useEffect, useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';

import { PageTitle } from '@/app/components/page-title';
import AuthenticatePage from '@/app/routes/authenticate';
import { FlowBuilderPage } from '@/app/routes/flows/id';


const routes = [
  {
    path: '/authenticate',
    element: <AuthenticatePage />,
  },
  {
    path: '/flows/:flowId',
    element: (
          <PageTitle title="Builder">
            <FlowBuilderPage />
          </PageTitle>
    ),
  },
];
const ApRouter = () => {
  const router = createBrowserRouter(routes);

  return <RouterProvider router={router}></RouterProvider>;
};

export { ApRouter };
