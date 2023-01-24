import React from 'react';
import {useTheme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {tokens} from '../global/theme';

type PropType = {
	title: string,
};

export const WidgetTitle = ({
	title,
}: PropType): JSX.Element => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	
	return <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>{title}</Typography>;
};
