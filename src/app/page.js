import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className="glass" style={{
        padding: '3rem',
        borderRadius: '24px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.jpg"
            alt="FFS Kate Logo"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              border: '1px solid var(--surface)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}
          />
        </div>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '1rem',
          background: 'linear-gradient(to right, var(--primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          FFS KATE
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2.5rem',
          fontSize: '1.1rem'
        }}>
          Fitter. Faster. Stronger.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/dashboard" style={{ width: '100%' }}>
            <button className="primary-btn" style={{
              background: 'var(--accent)',
              color: 'var(--background)',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              width: '100%',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)'
            }}>
              Client Login
            </button>
          </Link>

          <a href="https://www.instagram.com/ffs_kate/" target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
            <button style={{
              background: 'transparent',
              color: 'var(--primary)',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--surface)',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              width: '100%'
            }}>
              Find Out More
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}
