import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { useParams } from 'react-router-dom';

import { ShareTemplate } from '@/features/templates/components/share-template';
import { flagsHooks } from '@/hooks/flags-hooks';

const ShareTemplatePage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const queryClient = useQueryClient();
  const branding = flagsHooks.useWebsiteBranding(queryClient);

  if (!templateId) {
    return <div>{t('templateId is missing')}</div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
      <div className="h-[60px]">
        <img
          className="h-full"
          src={branding.logos.fullLogoUrl}
          alt={t('logo')}
        />
      </div>
      <ShareTemplate templateId={templateId} />
    </div>
  );
};

export { ShareTemplatePage };