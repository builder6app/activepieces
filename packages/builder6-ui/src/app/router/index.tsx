import { useEffect, useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  createMemoryRouter,
  useLocation,
} from 'react-router-dom';

import { PageTitle } from '@/app/components/page-title';
import PlatformSecondSidebarLayout from '../components/platform-second-sidebar-layout';
import ProjectSettingsLayout from '../components/project-settings-layout';
import { ChatPage } from '@/app/routes/chat';
import { EmbedPage } from '@/app/routes/embed';
import AnalyticsPage from '@/app/routes/platform/analytics';
import { ApiKeysPage } from '@/app/routes/platform/security/api-keys';
import { SigningKeysPage } from '@/app/routes/platform/security/signing-keys';
import { SSOPage } from '@/app/routes/platform/security/sso';
import AIProvidersPage from '@/app/routes/platform/setup/ai';
import { BrandingPage } from '@/app/routes/platform/setup/branding';
import { PlatformPiecesPage } from '@/app/routes/platform/setup/pieces';
import { RedirectPage } from '@/app/routes/redirect';
import { FlowRunsPage } from '@/app/routes/runs';
import { ProjectPiecesPage } from '@/app/routes/settings/pieces';
import { useEmbedding } from '@/components/embed-provider';
import { VerifyEmail } from '@/features/authentication/components/verify-email';
import { AcceptInvitation } from '@/features/team/component/accept-invitation';
import { ApFlagId, Permission } from '@activepieces/shared';
import {
  ActivepiecesClientEventName,
  ActivepiecesVendorEventName,
  ActivepiecesVendorRouteChanged,
} from 'ee-embed-sdk';

import { AllowOnlyLoggedInUserOnlyGuard } from '@/app/components/allow-logged-in-user-only-guard';
import { DashboardContainer } from '../components/dashboard-container';
import { PlatformAdminContainer } from '../components/platform-admin-container';
import NotFoundPage from '@/app/routes/404-page';
import AuthenticatePage from '@/app/routes/authenticate';
import { ChangePasswordPage } from '@/app/routes/change-password';
import { AppConnectionsPage } from '@/app/routes/connections';
import { EmbeddedConnectionDialog } from '@/app/routes/embed/embedded-connection-dialog';
import { FlowsPage } from '@/app/routes/flows';
import { FlowBuilderPage } from '@/app/routes/flows/id';
import { ResetPasswordPage } from '@/app/routes/forget-password';
import { FormPage } from '@/app/routes/forms';
import IssuesPage from '@/app/routes/issues';
import PlansPage from '@/app/routes/plans';
import SettingsHealthPage from '@/app/routes/platform/infra/health';
import SettingsWorkersPage from '@/app/routes/platform/infra/workers';
import { PlatformMessages } from '@/app/routes/platform/notifications/platform-messages';
import ProjectsPage from '@/app/routes/platform/projects';
import AuditLogsPage from '@/app/routes/platform/security/audit-logs';
import { ProjectRolePage } from '@/app/routes/platform/security/project-role';
import { GlobalConnectionsTable } from '@/app/routes/platform/setup/connections';
import { LicenseKeyPage } from '@/app/routes/platform/setup/license-key';
import TemplatesPage from '@/app/routes/platform/setup/templates';
import UsersPage from '@/app/routes/platform/users';
import { ProjectReleasesPage } from '@/app/routes/project-release';
import ViewRelease from '@/app/routes/project-release/view-release';
import { FlowRunPage } from '@/app/routes/runs/id';
import AlertsPage from '@/app/routes/settings/alerts';
import AppearancePage from '@/app/routes/settings/appearance';
import { EnvironmentPage } from '@/app/routes/settings/environment';
import GeneralPage from '@/app/routes/settings/general';
import TeamPage from '@/app/routes/settings/team';
import { SignInPage } from '@/app/routes/sign-in';
import { SignUpPage } from '@/app/routes/sign-up';
import { ShareTemplatePage } from '@/app/routes/templates/share-template';

import { AfterImportFlowRedirect } from '@/app/router/after-import-flow-redirect';
import { DefaultRoute } from '@/app/router/default-route';
import { FlagRouteGuard } from '@/app/router/flag-route-guard';
import { RoutePermissionGuard } from '@/app/router/permission-guard';
import { ProjectRouterWrapper } from '@/app/router/project-route-wrapper';
const SettingsRerouter = () => {
  const { hash } = useLocation();
  const fragmentWithoutHash = hash.slice(1).toLowerCase();
  return fragmentWithoutHash ? (
    <Navigate to={`/settings/${fragmentWithoutHash}`} replace />
  ) : (
    <Navigate to="/settings/general" replace />
  );
};

const routes = [
  {
    path: '/embed',
    element: <EmbedPage></EmbedPage>,
  },
  {
    path: '/embed/connections',
    element: <EmbeddedConnectionDialog></EmbeddedConnectionDialog>,
  },
  {
    path: '/authenticate',
    element: <AuthenticatePage />,
  },
  ...ProjectRouterWrapper({
    path: '/flows',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="Flows">
            <FlowsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/flows/:flowId',
    element: (
      <AllowOnlyLoggedInUserOnlyGuard>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="Builder">
            <FlowBuilderPage />
          </PageTitle>
        </RoutePermissionGuard>
      </AllowOnlyLoggedInUserOnlyGuard>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/flow-import-redirect/:flowId',
    element: (
      <AllowOnlyLoggedInUserOnlyGuard>
        <AfterImportFlowRedirect></AfterImportFlowRedirect>
      </AllowOnlyLoggedInUserOnlyGuard>
    ),
  }),
  {
    path: '/forms/:flowId',
    element: (
      <PageTitle title="Forms">
        <FormPage />
      </PageTitle>
    ),
  },
  {
    path: '/chats/:flowId',
    element: (
      <PageTitle title="Chats">
        <ChatPage />
      </PageTitle>
    ),
  },
  ...ProjectRouterWrapper({
    path: '/runs/:runId',
    element: (
      <AllowOnlyLoggedInUserOnlyGuard>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Flow Run">
            <FlowRunPage />
          </PageTitle>
        </RoutePermissionGuard>
      </AllowOnlyLoggedInUserOnlyGuard>
    ),
  }),
  {
    path: '/templates/:templateId',
    element: (
      <AllowOnlyLoggedInUserOnlyGuard>
        <PageTitle title="Share Template">
          <ShareTemplatePage />
        </PageTitle>
      </AllowOnlyLoggedInUserOnlyGuard>
    ),
  },
  ...ProjectRouterWrapper({
    path: '/releases/:releaseId',
    element: (
      <DashboardContainer>
        <PageTitle title="Releases">
          <ViewRelease />
        </PageTitle>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/runs',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Runs">
            <FlowRunsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/issues',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_ISSUES}>
          <PageTitle title="Issues">
            <IssuesPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/connections',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_APP_CONNECTION}>
          <PageTitle title="Connections">
            <AppConnectionsPage />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/releases',
    element: (
      <DashboardContainer>
        <PageTitle title="Releases">
          <ProjectReleasesPage />
        </PageTitle>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/plans',
    element: (
      <FlagRouteGuard flag={ApFlagId.SHOW_BILLING}>
        <DashboardContainer>
          <PageTitle title="Plans">
            <PlansPage />
          </PageTitle>
        </DashboardContainer>
      </FlagRouteGuard>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/settings',
    element: (
      <DashboardContainer>
        <SettingsRerouter></SettingsRerouter>
      </DashboardContainer>
    ),
  }),
  {
    path: '/forget-password',
    element: (
      <PageTitle title="Forget Password">
        <ResetPasswordPage />
      </PageTitle>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <PageTitle title="Reset Password">
        <ChangePasswordPage />
      </PageTitle>
    ),
  },
  {
    path: '/sign-in',
    element: (
      <PageTitle title="Sign In">
        <SignInPage />
      </PageTitle>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <PageTitle title="Verify Email">
        <VerifyEmail />
      </PageTitle>
    ),
  },
  {
    path: '/sign-up',
    element: (
      <PageTitle title="Sign Up">
        <SignUpPage />
      </PageTitle>
    ),
  },
  ...ProjectRouterWrapper({
    path: '/settings/alerts',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_ALERT}>
          <ProjectSettingsLayout>
            <PageTitle title="Alerts">
              <AlertsPage />
            </PageTitle>
          </ProjectSettingsLayout>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/settings/appearance',
    element: (
      <DashboardContainer>
        <ProjectSettingsLayout>
          <PageTitle title="Appearance">
            <AppearancePage />
          </PageTitle>
        </ProjectSettingsLayout>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/settings/general',
    element: (
      <DashboardContainer>
        <ProjectSettingsLayout>
          <PageTitle title="General">
            <GeneralPage />
          </PageTitle>
        </ProjectSettingsLayout>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/settings/pieces',
    element: (
      <DashboardContainer>
        <ProjectSettingsLayout>
          <PageTitle title="Pieces">
            <ProjectPiecesPage />
          </PageTitle>
        </ProjectSettingsLayout>
      </DashboardContainer>
    ),
  }),
  ...ProjectRouterWrapper({
    path: '/settings/team',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_PROJECT_MEMBER}>
          <ProjectSettingsLayout>
            <PageTitle title="Team">
              <TeamPage />
            </PageTitle>
          </ProjectSettingsLayout>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  {
    path: '/team',
    element: <Navigate to="/settings/team" replace></Navigate>,
  },

  ...ProjectRouterWrapper({
    path: '/settings/environments',
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_GIT_REPO}>
          <ProjectSettingsLayout>
            <PageTitle title="Environments">
              <EnvironmentPage />
            </PageTitle>
          </ProjectSettingsLayout>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),

  {
    path: '/invitation',
    element: (
      <PageTitle title="Accept Invitation">
        <AcceptInvitation />
      </PageTitle>
    ),
  },

  {
    path: '/404',
    element: (
      <PageTitle title="Not Found">
        <NotFoundPage />
      </PageTitle>
    ),
  },
  {
    path: '/platform/projects',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Projects">
          <ProjectsPage />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/pieces',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="Pieces">
            <PlatformPiecesPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/analytics',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Analytics">
          <div className="flex flex-col gap-4 w-full">
            <PlatformMessages />
            <AnalyticsPage />
          </div>
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Platform">
          <Navigate to="/platform/users" />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/connections',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="Connections">
            <GlobalConnectionsTable />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/templates',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="Templates">
            <TemplatesPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/branding',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="Branding">
            <BrandingPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/users',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Users">
          <UsersPage />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/ai',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="AI">
            <AIProvidersPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security/api-keys',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="security">
          <PageTitle title="API Keys">
            <ApiKeysPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security/audit-logs',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="security">
          <PageTitle title="Audit Logs">
            <AuditLogsPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/infrastructure/workers',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="infrastructure">
          <PageTitle title="Workers">
            <SettingsWorkersPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/infrastructure/health',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="infrastructure">
          <PageTitle title="System Health">
            <SettingsHealthPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security/signing-keys',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="security">
          <PageTitle title="Signing Keys">
            <SigningKeysPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security/sso',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="security">
          <PageTitle title="SSO">
            <SSOPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup/license-key',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="setup">
          <PageTitle title="LicenseKey">
            <LicenseKeyPage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security/project-roles',
    element: (
      <PlatformAdminContainer>
        <PlatformSecondSidebarLayout type="security">
          <PageTitle title="Project Roles">
            <ProjectRolePage />
          </PageTitle>
        </PlatformSecondSidebarLayout>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/setup',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Platform Setup">
          <Navigate to="/platform/setup/ai" replace />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/infrastructure',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Platform Infrastructure">
          <Navigate to="/platform/infrastructure/workers" replace />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/platform/security',
    element: (
      <PlatformAdminContainer>
        <PageTitle title="Platform Security">
          <Navigate to="/platform/security/audit-logs" replace />
        </PageTitle>
      </PlatformAdminContainer>
    ),
  },
  {
    path: '/redirect',
    element: <RedirectPage></RedirectPage>,
  },
  {
    path: '/*',
    element: (
      <PageTitle title="Redirect">
        <DefaultRoute></DefaultRoute>
      </PageTitle>
    ),
  },
];
const ApRouter = () => {
  const { embedState } = useEmbedding();

  const router = useMemo(() => {
    return embedState.isEmbedded
      ? createMemoryRouter(routes, {
          initialEntries: [window.location.pathname],
        })
      : createBrowserRouter(routes);
  }, [embedState.isEmbedded]);

  useEffect(() => {
    if (!embedState.isEmbedded) {
      return;
    }

    const handleVendorRouteChange = (
      event: MessageEvent<ActivepiecesVendorRouteChanged>,
    ) => {
      if (
        event.source === window.parent &&
        event.data.type === ActivepiecesVendorEventName.VENDOR_ROUTE_CHANGED
      ) {
        const targetRoute = event.data.data.vendorRoute;
        router.navigate(targetRoute);
      }
    };

    window.addEventListener('message', handleVendorRouteChange);

    return () => {
      window.removeEventListener('message', handleVendorRouteChange);
    };
  }, [embedState.isEmbedded, router.navigate]);

  useEffect(() => {
    if (!embedState.isEmbedded) {
      return;
    }
    router.subscribe((state) => {
      window.parent.postMessage(
        {
          type: ActivepiecesClientEventName.CLIENT_ROUTE_CHANGED,
          data: {
            route: state.location.pathname,
          },
        },
        '*',
      );
    });
  }, [router, embedState.isEmbedded]);

  return <RouterProvider router={router}></RouterProvider>;
};

export { ApRouter };