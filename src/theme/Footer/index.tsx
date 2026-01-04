import React, {JSX} from 'react';
import OriginalFooter from '@theme-original/Footer';
import ContributorFooter from '@site/src/components/ContributorFooter';

export default function Footer(props): JSX.Element {
  return (
    <>
      <ContributorFooter />
      <OriginalFooter {...props} />
    </>
  );
}
