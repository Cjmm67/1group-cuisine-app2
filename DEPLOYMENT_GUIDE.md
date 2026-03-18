# 1-Group Cuisine - Deployment Guide

## Quick Start (Development)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Open http://localhost:3000
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the official Next.js hosting platform and offers the best experience.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in dashboard
# NEXT_PUBLIC_API_URL=https://api.example.com
```

### Option 2: Docker

```bash
# Build Docker image
docker build -t 1group-cuisine .

# Run container
docker run -p 3000:3000 1group-cuisine
```

### Option 3: Self-Hosted (Linux)

```bash
# Prerequisites
sudo apt update
sudo apt install nodejs npm nginx

# Deploy
cd /var/www/1group-cuisine
git clone <repo-url> .
npm ci --production
npm run build

# Setup Nginx
sudo nano /etc/nginx/sites-available/default
# Add reverse proxy to localhost:3000

# Run with PM2
npm i -g pm2
pm2 start npm --name "1group-cuisine" -- start
pm2 startup
pm2 save
```

## Environment Variables

Create `.env.local` for development or `.env.production.local` for production:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=1-Group Cuisine
NEXT_PUBLIC_APP_DESCRIPTION=Professional culinary platform
```

## Performance Tips

1. **Image Optimization**: Enable Next.js Image component
2. **Caching**: Configure ISR (Incremental Static Regeneration) for recipe pages
3. **CDN**: Use a CDN for static assets
4. **Compression**: Enable gzip compression in Nginx/reverse proxy
5. **Database**: Connect to backend API for persistent data

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3000/api/health
```

### Logging

- Development: Check terminal output
- Production: Use Vercel Analytics or log to external service

## Scaling

For high traffic:

1. **Horizontal Scaling**: Run multiple instances behind load balancer
2. **Database Optimization**: Index frequently filtered columns
3. **Caching Layer**: Add Redis for session/query caching
4. **Static Generation**: Pre-generate recipe pages with ISR

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### API Connection Issues

1. Check `NEXT_PUBLIC_API_URL` environment variable
2. Verify API is running and accessible
3. Check CORS configuration on API server
4. Review browser console for errors

## SSL/TLS Certificate

For production, use HTTPS:

- **Vercel**: Automatic
- **Self-hosted**: Use Let's Encrypt (Certbot)

```bash
sudo certbot certonly --standalone -d yourdomain.com
```

## Backup & Recovery

```bash
# Backup environment variables
cp .env.production.local .env.backup

# Backup database (if applicable)
pg_dump your_db > backup.sql

# Restore
psql your_db < backup.sql
```

## Security Checklist

- [ ] Environment variables not in git
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API
- [ ] Input validation on forms
- [ ] SQL injection prevention (ORM)
- [ ] XSS protection (React/Next.js default)
- [ ] CSRF tokens for forms
- [ ] Regular security updates

## Performance Metrics Target

- Lighthouse Score: > 90
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

## Support

For deployment issues, check:
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
- GitHub Issues: https://github.com/vercel/next.js/issues

---

**Last Updated**: 2024
**Maintained by**: 1-Group Cuisine Development Team
