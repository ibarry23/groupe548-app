import { Component, useEffect, useLayoutEffect, type ReactNode } from 'react';
import { HashRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import { AppProvider, useApp } from '../lib/store';
import { Icon, type IconName } from '../components/Icons';
import { OfflineBar, ToastHost } from '../components/ui';
import { Home } from '../screens/Home';
import { Services } from '../screens/Services';
import { ServiceDetail } from '../screens/ServiceDetail';
import { Quote } from '../screens/Quote';
import { Confirmation } from '../screens/Confirmation';
import { RequestDetail, Requests } from '../screens/Requests';
import { About, Contact, Faq, More } from '../screens/More';

// New screens open at the top; going back restores where the customer was (native-app behaviour).
const scrollPositions = new Map<string, number>();
function ScrollManager() {
  const location = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    const key = location.key;
    const onScroll = () => scrollPositions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key]);
  useLayoutEffect(() => {
    const y = navType === 'POP' ? (scrollPositions.get(location.key) ?? 0) : 0;
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior }));
  }, [location.key, navType]);
  return null;
}

function TabBar() {
  const { t, requests } = useApp();
  const { pathname } = useLocation();
  if (pathname.startsWith('/quote')) return null;
  // The badge only counts requests that need the customer's attention.
  const attention = requests.filter((r) => r.status === 'queued' || r.status === 'failed').length;
  const tabs: { to: string; icon: IconName; label: string; badge?: number }[] = [
    { to: '/', icon: 'home', label: t.tabs.home },
    { to: '/services', icon: 'grid', label: t.tabs.services },
    { to: '/requests', icon: 'inbox', label: t.tabs.requests, badge: attention },
    { to: '/more', icon: 'more', label: t.tabs.more },
  ];
  return (
    <nav className="tabbar" aria-label="Navigation">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === '/'} className="tab">
          {({ isActive }) => (
            <>
              <span className="tab__iconwrap">
                <Icon key={isActive ? 'on' : 'off'} name={tab.icon} size={23} strokeWidth={isActive ? 2 : 1.7} draw={isActive} />
              </span>
              <span className="tab__label">{tab.label}</span>
              <span className="tab__dot" />
              {tab.badge ? <span className="tab__badge">{tab.badge}</span> : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Last line of defence: a runtime error shows a bilingual recovery screen instead of a blank page. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    const en = navigator.language?.toLowerCase().startsWith('en');
    return (
      <main className="crash" role="alert">
        <Icon name="alert" size={40} strokeWidth={1.6} />
        <h1 className="h2">{en ? 'Something went wrong' : 'Une erreur est survenue'}</h1>
        <p className="body">
          {en ? 'Your requests are kept on this device. Reload the app to continue.' : 'Vos demandes sont conservées sur cet appareil. Rechargez l’application pour continuer.'}
        </p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          {en ? 'Reload' : 'Recharger'}
        </button>
      </main>
    );
  }
}

function Shell() {
  return (
    <>
      <ScrollManager />
      <OfflineBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/quote/done/:ref" element={<Confirmation />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/:ref" element={<RequestDetail />} />
        <Route path="/more" element={<More />} />
        <Route path="/more/contact" element={<Contact />} />
        <Route path="/more/faq" element={<Faq />} />
        <Route path="/more/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <TabBar />
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <HashRouter>
          <Shell />
        </HashRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
