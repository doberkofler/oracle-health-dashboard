import React from 'react';
import {Box, useTheme} from '@mui/material';
import {tokens} from '../global/theme';

export const ProgressCircle = ({
	progress,
	size = '40',
}: {
	progress: number,
	size?: string,
}): JSX.Element => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const angle = progress * 360;

	if (progress < 0 || progress > 1) {
		throw new Error(`Invalid progress "${progress}"`);
	}

	const sx = {
		background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%), conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg), ${colors.greenAccent[500]}`,
		borderRadius: '50%',
		width: `${size}px`,
		height: `${size}px`,
	};

	return <Box sx={sx} />;
};
