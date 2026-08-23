/**
 * CampusKart Client-Side Router with Auth Guarding & History Management
 */

import { store } from '../data/store.js';

export class Router {
  constructor(routes = []) {
    this.routes = routes;
    this.currentRoute = null;
    this.params = {};
    this.queryParams = {};
    this.appContainer = null;
    this.init();
  }

  setContainer(element) {
    this.appContainer = element;
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  navigate(path) {
    if (!path.startsWith('/')) path = '/' + path;
    window.location.hash = path;
  }

  getCurrentPath() {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  }

  parseQueryParams(queryString) {
    const params = {};
    if (!queryString) return params;
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
    return params;
  }

  matchRoute(currentPath) {
    const [pathOnly, queryString] = currentPath.split('?');
    this.queryParams = this.parseQueryParams(queryString);

    for (const route of this.routes) {
      const paramNames = [];
      const regexPath = route.path
        .replace(/:\w+/g, match => {
          paramNames.push(match.slice(1));
          return '([^/]+)';
        })
        .replace(/\//g, '\\/');

      const match = pathOnly.match(new RegExp(`^${regexPath}$`));
      if (match) {
        this.params = {};
        paramNames.forEach((name, index) => {
          this.params[name] = match[index + 1];
        });
        return route;
      }
    }
    return null;
  }

  handleRouteChange() {
    const currentPath = this.getCurrentPath();
    const isAuth = store.isAuthenticated();
    const route = this.matchRoute(currentPath);

    if (!route) {
      // Fallback 404
      if (this.appContainer) {
        this.appContainer.innerHTML = `
          <div style="text-align: center; padding: 80px 20px;">
            <h1 class="display-md text-primary" style="margin-bottom: 12px;">404 — Pin Lost</h1>
            <p class="body-lg text-on-surface-variant" style="margin-bottom: 24px;">The notice you are looking for has been removed from the board.</p>
            <a href="#/feed" class="btn btn-primary">Back to Feed</a>
          </div>
        `;
      }
      return;
    }

    // Auth Guard check per PRD §3
    if (route.authRequired && !isAuth) {
      this.navigate(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    if (!route.authRequired && isAuth && (currentPath === '/' || currentPath.startsWith('/login') || currentPath.startsWith('/signup'))) {
      this.navigate('/feed');
      return;
    }

    this.currentRoute = route;
    if (route.handler) {
      route.handler({
        params: this.params,
        queryParams: this.queryParams,
        router: this
      });
    }

    window.scrollTo(0, 0);
  }
}
