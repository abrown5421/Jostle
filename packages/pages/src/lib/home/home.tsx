import { NavigationLink } from '@inithium/router';
import { useSelector } from 'react-redux';
import { selectActiveUser } from '@inithium/store';
import { Box, Button } from '@inithium/ui';
import React from 'react';

const Home: React.FC = () => {
  const activeUser = useSelector(selectActiveUser);
  const isAuthenticated = Boolean(activeUser?._id);

  return (
    <Box padding="md" className="h-full w-full flex flex-col justify-center items-center gap-4">
      <div 
        className={
          !isAuthenticated 
            ? "relative group flex justify-center w-[90%] md:w-[45%] lg:w-[25%]" 
            : "w-[90%] md:w-[45%] lg:w-[25%]"
        }
      >
        <Button 
          color='primary' 
          className="w-full" 
          disabled={!isAuthenticated}
        >
          <NavigationLink className='w-full' pageKey="host">Host</NavigationLink>
        </Button>
        
        {!isAuthenticated && (
          <div className="absolute bottom-full mb-2 hidden group-hover:scale-100 group-hover:block transition-all bg-neutral-900 text-danger text-xs rounded py-1 px-2 whitespace-nowrap shadow-md pointer-events-none before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-neutral-900">
            Login to host a game
          </div>
        )}
      </div>

      <Button color='accent' className="w-[90%] md:w-[45%] lg:w-[25%]">
        <NavigationLink className='w-full' pageKey="join">
          Join
        </NavigationLink>
      </Button>
    </Box>
  );
};

export default Home;