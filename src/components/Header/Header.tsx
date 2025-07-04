// -------------------------------------------------------------------------------------------

import './Header.scss';

// import { format } from 'date-fns';

import { memo, useCallback, useEffect, useState } from 'react';


import {
      Logout,  PersonOutline,
    Search, SearchOutlined
} from '@mui/icons-material';

import {
    
    IconButton, Menu, MenuItem,  Tooltip, 
} from '@mui/material';

 import AppLogo from '../AppLogo/AppLogo';

import { useApp } from '../../contexts/App/App';
import { useAuth } from '../../contexts/Auth/Auth';

import Alert from '../Alert/Alert';
import { AlertInterface } from '../Alert/Alert.types';
import { HeaderInterface } from './Header.types';


// -------------------------------------------------------------------------------------------

// const getMenuTooltip = (navigationState: string, windowWidth: number) => {
// 	if (navigationState === 'open') {
// 		return windowWidth > 600 ? 'Shrink Menu' : 'Close Menu';
// 	} else if (navigationState === 'semi-open') {
// 		return 'Close Menu';
// 	} else {
// 		return 'Open Menu';
// 	}
// };

// -------------------------------------------------------------------------------------------

// const getMenuIcon = (navigationState: string, windowWidth: number) => {
// 	if (navigationState === 'open' || navigationState === 'semi-open') {
// 		return <ChevronLeftOutlined />;
// 	} else if (windowWidth > 600) {
// 		return <ChevronRightOutlined />;
// 	} else {
// 		return <MenuOutlined />;
// 	}
// };

// -------------------------------------------------------------------------------------------

const Header = memo(({ navigationState }: HeaderInterface) => {

	
	
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);


	

	const { title } = useApp();
	const { handleLogout } = useAuth();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	// const [user, setUser] = useState<UserInterface>();
	const [alertDialog, setAlertDialog] = useState<AlertInterface>({
		state: 'success',
		label: '',
		isActive: false,
	});


	const updateWindowWidth = useCallback(() => {
		setWindowWidth(window.innerWidth);
	}, []);
	const [searchInput, setSearchInput] = useState<string>('');

	












	useEffect(() => {
		window.addEventListener('resize', updateWindowWidth);
		return () => {
			window.removeEventListener('resize', updateWindowWidth);
		};
	}, [updateWindowWidth]);

	// const menuTooltip = useMemo(
	// 	() => getMenuTooltip(navigationState, windowWidth),
	// 	[navigationState, windowWidth]
	// );
	// const menuIcon = useMemo(
	// 	() => getMenuIcon(navigationState, windowWidth),
	// 	[navigationState, windowWidth]
	// );

	const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setAnchorEl(null);
	};






	const handleCloseAlertDialog = () => {
		setAlertDialog({
			state: 'success',
			label: '',
			isActive: false,
		});
	};






	






	
	return (
		<>
			<div
				data-component='header'
				className='container'
			>
				<div
					data-component='header'
					className='left'
				>
<div
                     data-component='header'
                     className='left-logo'
                 >
                     <AppLogo
                         variant='dark'
                         iconOnly={
                             navigationState === 'semi-open' ||
                             navigationState === 'closed'
                         }
                     />
              </div>
					
					
					<div
						data-component='header'
						className='title title-large'
					>
						{title}
					</div>
				</div>
				<div
					data-component='header'
					className='right'
				>
					<div
						data-component='header'
						className='search'
					>
						<Tooltip title='Search Invoice Number'>
							<div
								data-component='header'
								className='icon'
							
							>
								<SearchOutlined />
							</div>
						</Tooltip>
						{windowWidth > 600 && (
							<>
								<input
									data-component='header'
									className='input body-large'
									placeholder='Search '
									type='number'
									value={searchInput}
									onChange={(event) =>
										setSearchInput(event.target.value)
									}
								
									
								/>
								<div
									data-component='header'
									className='button'
								>
									<Tooltip title='Search Invoice Number'>
										<IconButton
											color='primary'
											
										>
											
												<Search />
											
										</IconButton>
									</Tooltip>
								</div>
							</>
						)}
					</div>
					<Tooltip title='My Account'>
						<IconButton
							onClick={handleAvatarClick}
							color='primary'
						>
							<PersonOutline />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
					>
						<MenuItem onClick={handleLogout}>
							<Logout /> Logout
						</MenuItem>
					</Menu>
				</div>
			</div>
		
			
			<Alert
				{...alertDialog}
				onClose={handleCloseAlertDialog}
			/>
		</>
	);
});

// -------------------------------------------------------------------------------------------

export default Header;

// -------------------------------------------------------------------------------------------
