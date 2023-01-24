import React, {useContext} from 'react';
import {styled, alpha} from '@mui/material/styles';
import {Box, IconButton, useTheme, Toolbar, Typography} from '@mui/material';
import {ColorModeContext/*, tokens*/} from '../global/theme';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Badge from '@mui/material/Badge';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';

type paraType = {
	title: string,
	open: boolean,
	handleDrawerOpen: () => void,
};

const Search = styled('div')(({theme}) => ({
	position: 'relative',
	borderRadius: theme.shape.borderRadius,
	backgroundColor: alpha(theme.palette.common.white, 0.15),
	'&:hover': {
		backgroundColor: alpha(theme.palette.common.white, 0.25),
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: '100%',
	[theme.breakpoints.up('sm')]: {
		marginLeft: theme.spacing(3),
		width: 'auto',
	},
}));

const SearchIconWrapper = styled('div')(({theme}) => ({
	padding: theme.spacing(0, 2),
	height: '100%',
	position: 'absolute',
	pointerEvents: 'none',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({theme}) => ({
	color: 'inherit',
	'& .MuiInputBase-input': {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('md')]: {
			width: '20ch',
		},
	},
}));

export const Topbar = ({
	title,
	open,
	handleDrawerOpen,
}: paraType): JSX.Element => {
	const theme = useTheme();
	//const colors = tokens(theme.palette.mode);
	const colorMode = useContext(ColorModeContext);
	const handleColorMode = (): void => {
		// eslint-disable-next-line react/destructuring-assignment
		colorMode.toggleColorMode();
	};

	const menuId = 'primary-search-account-menu';
	const mobileMenuId = 'primary-search-account-menu-mobile';
	const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
		console.log(event);
	};
	const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
		console.log(event);
	};
	
	return (
		<Toolbar>
			<IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" sx={{marginRight: 5, ...(open && {display: 'none'})}}>
				<MenuIcon />
			</IconButton>
			<Typography variant="h4" noWrap component="div" sx={{display: {xs: 'none', sm: 'block'}}}>
				{title}
			</Typography>
			<Search>
				<SearchIconWrapper>
					<SearchIcon />
				</SearchIconWrapper>
				<StyledInputBase placeholder="Search…" inputProps={{'aria-label': 'search'}} />
			</Search>
			<Box sx={{flexGrow: 1}} />
			<Box sx={{display: {xs: 'none', md: 'flex'}}}>
				<IconButton size="large" aria-label="show 4 new mails" color="inherit">
					<Badge badgeContent={4} color="error">
						<MailIcon />
					</Badge>
				</IconButton>
				<IconButton size="large" aria-label="show 17 new notifications" color="inherit">
					<Badge badgeContent={17} color="error">
						<NotificationsIcon />
					</Badge>
				</IconButton>
				<IconButton size="large" edge="end" aria-label="account of current user" aria-controls={menuId} aria-haspopup="true" onClick={handleProfileMenuOpen} color="inherit">
					<AccountCircle />
				</IconButton>
				<IconButton size="large" edge="end" aria-label="dark mode" aria-controls={menuId} aria-haspopup="true" color="inherit" onClick={handleColorMode}>
					{theme.palette.mode === 'dark' ? (<DarkModeOutlinedIcon />) : (<LightModeOutlinedIcon />)}
				</IconButton>
			</Box>
			<Box sx={{display: {xs: 'flex', md: 'none'}}}>
				<IconButton size="large" aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
					<MoreIcon />
				</IconButton>
			</Box>
		</Toolbar>
	);
};
