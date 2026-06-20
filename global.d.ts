import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        trigger?: string;
        delay?: string | number;
        stroke?: string;
        colors?: string;
        target?: string;
        state?: string;
        icon?: string;
      };
    }
  }
}
