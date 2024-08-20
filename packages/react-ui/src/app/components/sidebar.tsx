import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { FileTextIcon, LockKeyhole } from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { flagsHooks } from '@/hooks/flags-hooks';

import { Header } from './header';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ApFlagId, supportUrl } from '../../../../shared/src';
type Link = {
  icon: React.ReactNode;
  label: string;
  to: string;
  notification?: boolean;
};

type CustomTooltipLinkProps = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  extraClasses?: string;
  notification?: boolean;
  locked?: boolean;
  newWindow?: boolean;
};
const CustomTooltipLink = ({
  to,
  label,
  Icon,
  extraClasses,
  notification,
  locked,
  newWindow,
}: CustomTooltipLinkProps) => {
  const location = useLocation();

  const isActive = location.pathname.startsWith(to);

  return (
    <Link to={to} target={newWindow ? '_blank' : ''} rel={newWindow ? 'noopener noreferrer' : ''}>
      <div
        className={`relative flex flex-col items-center justify-center gap-1`}
      >
        {locked && (
          <LockKeyhole
            className="absolute right-[-1px] bottom-[20px] size-3"
            color="grey"
          />
        )}
        <Icon
          className={`size-10 p-2.5 hover:text-primary rounded-lg transition-colors ${
            isActive ? 'bg-accent text-primary' : ''
          } ${extraClasses || ''}`}
        />
        <span className="text-[10px]">{label}</span>
        {notification && (
          <span className="bg-destructive absolute right-[-3px] top-[-3px] size-2 rounded-full"></span>
        )}
      </div>
    </Link>
  );
};

export type SidebarLink = {
  to: string;
  label: string;
  icon: React.ElementType;
  notification?: boolean;
  locked?: boolean;
};

type SidebarProps = {
  children: React.ReactNode;
  links: SidebarLink[];
  isHomeDashboard?: boolean;
};
export function Sidebar({ children, links, isHomeDashboard }: SidebarProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const branding = flagsHooks.useWebsiteBranding(queryClient);
  const showSupportAndDocs = flagsHooks.useFlag<boolean>(ApFlagId.SHOW_COMMUNITY, queryClient);
  return (
    <div className="flex min-h-screen w-full  ">
      <aside className=" border-r sticky  top-0 h-screen bg-muted/50 w-[65px] ">
        <ScrollArea>
          <nav className="flex flex-col items-center h-screen  sm:py-5  gap-5 p-2 ">
            <div
              className="h-[48px] items-center justify-center cursor-pointer"
              onClick={() => navigate('/flows')}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/">
                    <img
                      src={branding.logos.logoIconUrl}
                      alt={t('home')}
                      width={28}
                      height={28}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {branding.websiteName}
                </TooltipContent>
              </Tooltip>
            </div>
            {links.map((link, index) => (
              <CustomTooltipLink
                to={link.to}
                label={link.label}
                Icon={link.icon}
                key={index}
                locked={link.locked}
              />
            ))}

            <div className='grow'></div>
            {
              isHomeDashboard && showSupportAndDocs &&( <>
                <CustomTooltipLink
                  to={supportUrl}
                  label={t('Support')}
                  Icon={QuestionMarkCircledIcon}
                  newWindow={true}
                />
                <CustomTooltipLink
                  to="https://activepieces.com/docs"
                  label={t('Docs')}
                  Icon={FileTextIcon}
                  newWindow={true}
                />
            
              </>)
            }
          </nav>
        </ScrollArea>
      </aside>
      <div className="flex-1 p-4">
        <div className="flex flex-col">
          <Header />
          <div className="container mx-auto flex py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}