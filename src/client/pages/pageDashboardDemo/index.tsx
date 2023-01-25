import React from 'react';
import ReactDOM from 'react-dom/client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter} from 'react-router-dom';
import {ThemeProvider} from '@mui/material/styles';
import {ColorModeContext, useMode} from '../../../shared/components/global/theme';
import {DashboardApp} from '../../../shared/components/Dashboard/DashboardApp';

const queryClient = new QueryClient();

const App = (): JSX.Element => {
	const [theme, colorMode] = useMode();

	return (
		<React.StrictMode>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<ColorModeContext.Provider value={colorMode}>
						<ThemeProvider theme={theme}>
							<DashboardApp title="Oracle Health Dashboard" subtitle="Welcome to your dashboard" />
						</ThemeProvider>
					</ColorModeContext.Provider>
				</BrowserRouter>
			</QueryClientProvider>
		</React.StrictMode>
	);
};

const container = document.getElementById('root');
if (container) {
	ReactDOM.createRoot(container).render(<App />);
}
