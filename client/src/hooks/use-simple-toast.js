import { useToast } from '@chakra-ui/react';

const useSimpleToast = () => {
  const toast = useToast();

  const defaultOptions = {
    duration: 3000,
    isClosable: true,
    position: 'top-right',
  };

  return {
    info: message =>
      toast({
        title: message,
        status: 'info',
        ...defaultOptions,
      }),
    error: message =>
      toast({
        title: message,
        status: 'error',
        ...defaultOptions,
      }),
    success: message =>
      toast({
        title: message,
        status: 'success',
        ...defaultOptions,
      }),
  };
};

export default useSimpleToast;
