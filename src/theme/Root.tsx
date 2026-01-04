import React, {JSX} from 'react';
import BuyMeCoffeeWidget from '@site/src/components/BuyMeCoffee';

// Root wrapper that adds global components
export default function Root({children}: {children: React.ReactNode}): JSX.Element {
  return (
    <>
      {children}
      <BuyMeCoffeeWidget />
    </>
  );
}
