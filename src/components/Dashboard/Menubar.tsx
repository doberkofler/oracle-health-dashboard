/* eslint-disable react/no-array-index-key */

import React from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

type menuItemType = {
	text: string,
	icon: JSX.Element,
};

export type menuGroupType = {
	items: menuItemType[],
	title?: string,
	dividerBefore?: boolean,
	dividerAfter?: boolean,
};

type ItemProp = menuItemType & {
	drawerOpen: boolean,
};

const Item = ({
	drawerOpen,
	text,
	icon,
}: ItemProp): JSX.Element => {
	return (
		<ListItem key={text} disablePadding sx={{display: 'block'}}>
			<ListItemButton sx={{minHeight: 48, justifyContent: drawerOpen ? 'initial' : 'center', px: 2.5}}>
				<ListItemIcon sx={{minWidth: 0, mr: drawerOpen ? 3 : 'auto', justifyContent: 'center'}}>
					{icon}
				</ListItemIcon>
				<ListItemText primary={text} sx={{opacity: drawerOpen ? 1 : 0}} />
			</ListItemButton>
		</ListItem>
	);
};

type GroupProp = {
	drawerOpen: boolean,
	group: menuGroupType,
};

const Title = ({
	drawerOpen,
	group,
}: GroupProp): JSX.Element | null => {
	if (typeof group.title === 'string' && group.title.length > 0) {
		if (drawerOpen) {
			return <Typography variant="h6" color="inherit" sx={{m: '15px 0 5px 20px'}}>{group.title}</Typography>;
		} else if (group.dividerBefore !== true) {
			return <Divider />;
		}
	}

	return null;
};

const Group = ({
	drawerOpen,
	group,
}: GroupProp): JSX.Element => {
	return (
		<>
			{group.dividerBefore === true ? <Divider /> : null}
			<Title drawerOpen={drawerOpen} group={group} />
			<List>
				{group.items.map(item => <Item key={item.text} drawerOpen={drawerOpen} text={item.text} icon={item.icon} />)}
			</List>
			{group.dividerAfter === true ? <Divider /> : null}
		</>
	);
};

type MenubarProp = {
	drawerOpen: boolean,
	groups: menuGroupType[],
};

export const Menubar = ({
	drawerOpen,
	groups,
}: MenubarProp): JSX.Element => {
	return (
		<>
			{groups.map((group, index) => <Group key={index} drawerOpen={drawerOpen} group={group} />)}
		</>
	);
};
