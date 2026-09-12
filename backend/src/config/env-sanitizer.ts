const defaultNeonUrl =
  'postgresql://neondb_owner:npg_zriZkC1WQph9@ep-hidden-shape-b3qm86ks-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&connect_timeout=15&connection_limit=10&keepalive=true&pool_timeout=15';

if (
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes('skillbridge') ||
  process.env.DATABASE_URL.includes('dpg-dabv7k6k1f9s73dlugog')
) {
  process.env.DATABASE_URL = defaultNeonUrl;
}

export {};
