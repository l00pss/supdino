import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BuyMeCoffeeButton from '@site/src/components/BuyMeCoffeeButton';
import {useLatestDocs, formatReadingTime} from '@site/src/hooks/useLatestDocs';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.logoContainer}>
              <img
                src="/img/logo_dark.svg"
                alt="SupDino Logo"
                className={styles.heroLogo}
              />
            </div>
            <Heading as="h1" className={styles.heroTitle}>
              {siteConfig.title}
            </Heading>
            <p className={styles.heroSubtitle}>
              Master the fundamentals of computer science with comprehensive guides,
              practical examples, and real-world applications.
            </p>
            <div className={styles.heroButtons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/algorithms/intro">
                Get Started
              </Link>
              <Link
                className="button button--secondary button--outline button--lg"
                to="/blog">
                Read Blog
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <div className={styles.terminalButtons}>
                  <span className={styles.terminalButton}></span>
                  <span className={styles.terminalButton}></span>
                  <span className={styles.terminalButton}></span>
                </div>
                <span className={styles.fileName}>dijkstra.go</span>
                <span className={styles.codeLang}>go</span>
              </div>
              <pre className={styles.codeContent}>
                <span className="token comment">// Dijkstra's Algorithm Implementation</span>{'\n'}
                <span className="token keyword">type</span> <span className="token class-name">Edge</span> <span className="token keyword">struct</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'    '}<span className="token property">to</span>     <span className="token builtin">int</span>{'\n'}
                {'    '}<span className="token property">weight</span> <span className="token builtin">int</span>{'\n'}
                <span className="token punctuation">{'}'}</span>{'\n'}
                {'\n'}
                <span className="token keyword">type</span> <span className="token class-name">Graph</span> <span className="token keyword">struct</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'    '}<span className="token property">vertices</span> <span className="token builtin">int</span>{'\n'}
                {'    '}<span className="token property">edges</span>    <span className="token punctuation">[][]</span><span className="token class-name">Edge</span>{'\n'}
                <span className="token punctuation">{'}'}</span>{'\n'}
                {'\n'}
                <span className="token keyword">func</span> <span className="token punctuation">(</span><span className="token parameter">g</span> <span className="token operator">*</span><span className="token class-name">Graph</span><span className="token punctuation">)</span> <span className="token function">AddEdge</span><span className="token punctuation">(</span><span className="token parameter">from</span><span className="token punctuation">,</span> <span className="token parameter">to</span><span className="token punctuation">,</span> <span className="token parameter">weight</span> <span className="token builtin">int</span><span className="token punctuation">)</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'    '}<span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">edges</span><span className="token punctuation">[</span><span className="token parameter">from</span><span className="token punctuation">]</span> <span className="token operator">=</span> <span className="token function">append</span><span className="token punctuation">(</span><span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">edges</span><span className="token punctuation">[</span><span className="token parameter">from</span><span className="token punctuation">],</span> {'\n'}
                {'        '}<span className="token class-name">Edge</span><span className="token punctuation">{'{'}</span><span className="token property">to</span><span className="token punctuation">:</span> <span className="token parameter">to</span><span className="token punctuation">,</span> <span className="token property">weight</span><span className="token punctuation">:</span> <span className="token parameter">weight</span><span className="token punctuation">{'}})'}</span>{'\n'}
                <span className="token punctuation">{'}'}</span>{'\n'}
                {'\n'}
                <span className="token keyword">func</span> <span className="token punctuation">(</span><span className="token parameter">g</span> <span className="token operator">*</span><span className="token class-name">Graph</span><span className="token punctuation">)</span> <span className="token function">Dijkstra</span><span className="token punctuation">(</span><span className="token parameter">start</span> <span className="token builtin">int</span><span className="token punctuation">)</span> <span className="token punctuation">[]</span><span className="token builtin">int</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'    '}<span className="token parameter">dist</span> <span className="token operator">:=</span> <span className="token function">make</span><span className="token punctuation">([]</span><span className="token builtin">int</span><span className="token punctuation">,</span> <span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">vertices</span><span className="token punctuation">)</span>{'\n'}
                {'    '}<span className="token parameter">visited</span> <span className="token operator">:=</span> <span className="token function">make</span><span className="token punctuation">([]</span><span className="token builtin">bool</span><span className="token punctuation">,</span> <span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">vertices</span><span className="token punctuation">)</span>{'\n'}
                {'    '}{'\n'}
                {'    '}<span className="token keyword">for</span> <span className="token parameter">i</span> <span className="token operator">:=</span> <span className="token keyword">range</span> <span className="token parameter">dist</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'        '}<span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">i</span><span className="token punctuation">]</span> <span className="token operator">=</span> <span className="token property">math</span><span className="token punctuation">.</span><span className="token property">MaxInt32</span>{'\n'}
                {'    '}<span className="token punctuation">{'}'}</span>{'\n'}
                {'    '}<span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">start</span><span className="token punctuation">]</span> <span className="token operator">=</span> <span className="token number">0</span>{'\n'}
                {'    '}{'\n'}
                {'    '}<span className="token keyword">for</span> <span className="token parameter">i</span> <span className="token operator">:=</span> <span className="token number">0</span><span className="token punctuation">;</span> <span className="token parameter">i</span> <span className="token operator">{'<'}</span> <span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">vertices</span><span className="token operator">-</span><span className="token number">1</span><span className="token punctuation">;</span> <span className="token parameter">i</span><span className="token operator">++</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'        '}<span className="token parameter">u</span> <span className="token operator">:=</span> <span className="token function">minDistance</span><span className="token punctuation">(</span><span className="token parameter">dist</span><span className="token punctuation">,</span> <span className="token parameter">visited</span><span className="token punctuation">)</span>{'\n'}
                {'        '}<span className="token parameter">visited</span><span className="token punctuation">[</span><span className="token parameter">u</span><span className="token punctuation">]</span> <span className="token operator">=</span> <span className="token boolean">true</span>{'\n'}
                {'        '}{'\n'}
                {'        '}<span className="token keyword">for</span> <span className="token parameter">_</span><span className="token punctuation">,</span> <span className="token parameter">edge</span> <span className="token operator">:=</span> <span className="token keyword">range</span> <span className="token parameter">g</span><span className="token punctuation">.</span><span className="token property">edges</span><span className="token punctuation">[</span><span className="token parameter">u</span><span className="token punctuation">]</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'            '}<span className="token parameter">v</span> <span className="token operator">:=</span> <span className="token parameter">edge</span><span className="token punctuation">.</span><span className="token property">to</span>{'\n'}
                {'            '}<span className="token keyword">if</span> <span className="token operator">!</span><span className="token parameter">visited</span><span className="token punctuation">[</span><span className="token parameter">v</span><span className="token punctuation">]</span> <span className="token operator">&&</span> <span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">u</span><span className="token punctuation">]</span> <span className="token operator">!=</span> <span className="token property">math</span><span className="token punctuation">.</span><span className="token property">MaxInt32</span> <span className="token operator">&&</span>{'\n'}
                {'               '}<span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">u</span><span className="token punctuation">]</span><span className="token operator">+</span><span className="token parameter">edge</span><span className="token punctuation">.</span><span className="token property">weight</span> <span className="token operator">{'<'}</span> <span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">v</span><span className="token punctuation">]</span> <span className="token punctuation">{'{'}</span>{'\n'}
                {'                '}<span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">v</span><span className="token punctuation">]</span> <span className="token operator">=</span> <span className="token parameter">dist</span><span className="token punctuation">[</span><span className="token parameter">u</span><span className="token punctuation">]</span> <span className="token operator">+</span> <span className="token parameter">edge</span><span className="token punctuation">.</span><span className="token property">weight</span>{'\n'}
                {'            '}<span className="token punctuation">{'}'}</span>{'\n'}
                {'        '}<span className="token punctuation">{'}'}</span>{'\n'}
                {'    '}<span className="token punctuation">{'}'}</span>{'\n'}
                {'    '}<span className="token keyword">return</span> <span className="token parameter">dist</span>{'\n'}
                <span className="token punctuation">{'}'}</span>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LatestArticlesSection() {
  const latestDocs = useLatestDocs(3);

  // Fallback articles in case dynamic loading fails
  const fallbackArticles = [
    {
      title: 'Write-Ahead Logging (WAL)',
      category: 'Distributed Systems',
      description: 'Write-Ahead Logging (WAL) is a fundamental technique in database systems that ensures data durability and consistency by recording changes to a log before applying them to the actual data store.',
      link: '/docs/distributed-systems/replication/wal',
      readingTime: 25,
    },
    {
      title: 'Segmented Log Architecture',
      category: 'Distributed Systems',
      description: 'The Segmented Log architecture addresses scalability limitations in WAL systems by partitioning logs into bounded segments for better performance and maintenance.',
      link: '/docs/distributed-systems/replication/segmented-log',
      readingTime: 18,
    },
    {
      title: 'Quick Sort Algorithm',
      category: 'Algorithms',
      description: 'Quick Sort is one of the most efficient sorting algorithms using divide-and-conquer strategy to achieve O(n log n) average-case performance.',
      link: '/docs/algorithms/sorting/quick-sort',
      readingTime: 12,
    }
  ];

  const articles = latestDocs.length > 0 ? latestDocs : fallbackArticles;

  return (
    <section className={styles.latestArticles}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Latest Articles</h2>
          <p className={styles.sectionSubtitle}>
            Explore our most recent in-depth technical articles
          </p>
        </div>
        <div className={styles.articlesGrid}>
          {articles.map((article, idx) => (
            <Link
              key={idx}
              to={article.link}
              className={styles.articleCard}
            >
              <span className={styles.articleCategory}>{article.category}</span>
              <h3 className={styles.articleTitle}>{article.title}</h3>
              <p className={styles.articleExcerpt}>{article.description}</p>
              <div className={styles.articleMeta}>
                <span className={styles.readTime}>{formatReadingTime(article.readingTime)}</span>
                <span className={styles.readMore}>Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="SupDino - Computer Science Mastery"
      description="Master algorithms, mathematics, and distributed systems with comprehensive guides, Go implementations, and practical examples.">
      <HomepageHeader />
      <main>
        <LatestArticlesSection />
        <section style={{ padding: '4rem 0', textAlign: 'center', backgroundColor: 'var(--ifm-background-color)' }}>
          <div className="container">
            <h2>Support SupDino</h2>
            <p>Help us create more quality content and maintain this educational resource!</p>
            <BuyMeCoffeeButton username="l00pss" message="Buy me a coffee" />
          </div>
        </section>
      </main>
    </Layout>
  );
}
