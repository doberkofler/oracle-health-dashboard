import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {useTheme, styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import {Topbar} from './Topbar';
import {Menubar} from './Menubar';
import {Dashboard} from './Dashboard';
import {groups} from './menuItems';
import {CircularIndeterminate} from '../CircularIndeterminate';
import {ErrorPage} from '../ErrorPage';

import {useConfig} from '../../data/dashboard';

import type {CSSObject, Theme} from '@mui/material/styles';
import type {AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: 'hidden',
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const DrawerHeader = styled('div')(({theme}) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'flex-end',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
	open?: boolean,
}

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme, open}) => ({
	zIndex: theme.zIndex.drawer + 1,
	transition: theme.transitions.create(['width', 'margin'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open === true && {
		marginLeft: drawerWidth,
		width: `calc(100% - ${drawerWidth}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
	({theme, open}) => ({
		width: drawerWidth,
		flexShrink: 0,
		whiteSpace: 'nowrap',
		boxSizing: 'border-box',
		...(open === true && {
			...openedMixin(theme),
			'& .MuiDrawer-paper': openedMixin(theme),
		}),
		...(open !== true && {
			...closedMixin(theme),
			'& .MuiDrawer-paper': closedMixin(theme),
		}),
	}),
);

type PropType = {
	title: string,
	subtitle: string,
};

export const DashboardApp = ({
	title,
	subtitle,
}: PropType): JSX.Element => {
	const theme = useTheme();
	const [drawerOpen, setDrawerOpen] = React.useState(false);

	const handleDrawerOpen = (): void => {
		setDrawerOpen(true);
	};

	const handleDrawerClose = (): void => {
		setDrawerOpen(false);
	};

	const status = useConfig();
	if (status.isLoading) {
		return <CircularIndeterminate />;
	}
	if (status.error) {
		return <ErrorPage error={status.error.message} />;
	}

	return (
		<Box sx={{display: 'flex'}}>
			<CssBaseline />
			<AppBar position="fixed" open={drawerOpen}>
				<Topbar title={title} open={drawerOpen} handleDrawerOpen={handleDrawerOpen} />
			</AppBar>
			<Drawer variant="permanent" open={drawerOpen}>
				<DrawerHeader>
					<IconButton onClick={handleDrawerClose}>
						{theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
					</IconButton>
				</DrawerHeader>
				<Menubar drawerOpen={drawerOpen} groups={groups} />
			</Drawer>
			<Box component="main" sx={{flexGrow: 1, p: 3}}>
				<DrawerHeader />
				<Dashboard title={title} subtitle={subtitle} />
			</Box>
		</Box>
	);
};
