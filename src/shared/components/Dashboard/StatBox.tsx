import React from 'react';
import {Box, Typography, useTheme} from '@mui/material';
import {tokens} from '../global/theme';
import {ProgressCircle} from './ProgressCircle';

export const StatBox = ({
	title,
	subtitle,
	icon,
	progress,
	increase,
}: {
	title: string,
	subtitle: string,
	icon: JSX.Element,
	progress: number,
	increase: string,
}): JSX.Element => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);

	return (
		<Box width="100%" m="0 30px">
			<Box display="flex" justifyContent="space-between">
				<Box>
					{icon}
					<Typography variant="h5" fontWeight="bold" sx={{color: colors.grey[100]}}>{title}</Typography>
				</Box>
				<Box>
					<ProgressCircle progress={progress} />
				</Box>
			</Box>
			<Box display="flex" justifyContent="space-between" mt="2px">
				<Typography variant="h6" sx={{color: colors.greenAccent[500]}}>{subtitle}</Typography>
				<Typography variant="h6" fontStyle="italic" sx={{color: colors.greenAccent[600]}}>{increase}</Typography>
			</Box>
		</Box>
	);
};
