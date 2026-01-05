import React from 'react';
import DocItemFooter from '@theme-original/DocItem/Footer';
import ShareButton from '../../../components/ShareButton';
import FontSizeControl from '../../../components/FontSizeControl';

export default function DocItemFooterWrapper(props) {
  return (
    <>
      <FontSizeControl />
      <DocItemFooter {...props} />
      <ShareButton />
    </>
  );
}
