import React from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

//import type {menuGroupType} from './Menubar';

export const groups = [
	{
		items: [
			{
				text: 'Dashboard',
				icon: <HomeOutlinedIcon />,
			},
		],
	},
	{
		title: 'Data',
		items: [
			{
				text: 'Manage Team',
				icon: <PeopleOutlinedIcon />,
			},
			{
				text: 'Contact Information',
				icon: <ContactsOutlinedIcon />,
			},
			{
				text: 'Invoice Balances',
				icon: <ReceiptOutlinedIcon />,
			},
		],
	},
	{
		title: 'Pages',
		items: [
			{
				text: 'Profile Form',
				icon: <PersonOutlinedIcon />,
			},
			{
				text: 'Calendar',
				icon: <CalendarTodayOutlinedIcon />,
			},
			{
				text: 'FAQ Page',
				icon: <HelpOutlineOutlinedIcon />,
			},
			{
				text: 'Bar Chart',
				icon: <BarChartOutlinedIcon />,
			},
			{
				text: 'Pie Chart',
				icon: <PieChartOutlineOutlinedIcon />,
			},
			{
				text: 'Line Chart',
				icon: <TimelineOutlinedIcon />,
			},
			{
				text: 'Geography Chart',
				icon: <MapOutlinedIcon />,
			},
		],
	},
];
