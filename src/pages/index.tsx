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
                <span className={styles.codeLang}>go</span>
              </div>
              <pre className={styles.codeContent}>
{`func QuickSort(arr []int) {
  if len(arr) <= 1 {
    return
  }
  
  pivot := partition(arr)
  QuickSort(arr[:pivot])
  QuickSort(arr[pivot+1:])
}`}
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
