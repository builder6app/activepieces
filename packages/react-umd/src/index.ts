import { FlowBuilderPage } from '@/app/routes/flows/id';
import { withBuilder } from '@builder6/react';

withBuilder(FlowBuilderPage, {
  name: 'AP:FlowBuilder',
  inputs: [
    {
      name: 'flowId',
      type: 'string',
      required: true,
    },
  ],
});

export {
  FlowBuilderPage,
}