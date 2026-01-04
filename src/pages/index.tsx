import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

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
                src="/img/logo.svg"
                alt="The8ArmsHub Logo"
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

function FeaturesSection() {
  const features = [
    {
      title: 'Algorithms & Data Structures',
      icon: '🧠',
      description: 'Master sorting, searching, graph algorithms, and dynamic programming with step-by-step explanations.',
      link: '/docs/algorithms/intro'
    },
    {
      title: 'Mathematical Foundations',
      icon: '📐',
      description: 'Linear algebra, calculus, discrete math, and statistics for computer science applications.',
      link: '/docs/mathematics/intro'
    },
    {
      title: 'Distributed Systems',
      icon: '🌐',
      description: 'Build scalable, fault-tolerant systems with consensus algorithms and system design patterns.',
      link: '/docs/distributed-systems/intro'
    }
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <span className={styles.featureArrow}>→</span>
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
      title="The8ArmsHub - Computer Science Mastery"
      description="Master algorithms, mathematics, and distributed systems with comprehensive guides, Go implementations, and practical examples.">
      <HomepageHeader />
      <main>
        <FeaturesSection />
      </main>
    </Layout>
  );
}
