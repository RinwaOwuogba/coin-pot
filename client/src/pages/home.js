import {
  Button,
  Flex,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  VStack,
  Spinner,
  Center,
  Box,
  ButtonGroup,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { approve } from '../utils';
import { useQuery, useQueryClient } from 'react-query';
import BigNumber from 'bignumber.js';
import { ERC20_DECIMALS } from '../constants';
import useSimpleToast from '../hooks/use-simple-toast';
import Header from '../components/header';
import NewLockModal from '../components/new-lock-modal';
import WithdrawModal from '../components/withdraw-modal';
import DepositModal from '../components/deposit-modal';

const Home = ({ data }) => {
  const { contract, kit } = data;

  const queryClient = useQueryClient();
  const activeLockQuery = useQuery('activeLock', async () => {
    // return {
    //   isActive: true,
    //   balance: 100000000000000000,
    //   unlockDate: new Date(),
    // };
    const result = await contract.methods.getActiveLock().call();

    result.unlockDate = new Date(Number(result.unlockDate) * 1000);
    if (result.unlockDate < new Date()) {
      result.isActive = false;
    } else {
      result.isActive = true;
    }

    return result;
  });

  const simpleToast = useSimpleToast();

  const newLockDisclosure = useDisclosure();
  const withdrawDisclosure = useDisclosure();
  const depositDisclosure = useDisclosure();

  const newLockForm = useForm();
  const withdrawForm = useForm();
  const depositForm = useForm();

  const onSubmit = async data => {
    console.log(data);

    const { amount, days } = data;
    const shiftedAmount = new BigNumber(amount)
      .shiftedBy(ERC20_DECIMALS)
      .toString();

    simpleToast.info('Waiting for payment approval...');

    try {
      await approve(kit, shiftedAmount);
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }

    simpleToast.info(`Awaiting deposit of ${amount}`);

    try {
      await contract.methods
        .newLock(shiftedAmount, days)
        .send({ from: kit.defaultAccount });

      simpleToast.success(
        `You successfully created a ${days} day(s) lock for $${amount}`
      );

      queryClient.invalidateQueries('activeLock');
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  const onWithdraw = async data => {
    console.log(data);

    const { amount } = data;
    const shiftedAmount = new BigNumber(amount)
      .shiftedBy(ERC20_DECIMALS)
      .toString();

    simpleToast.info(`Attempting withdraw of $${amount}`);

    try {
      await contract.methods
        .withdrawFromLock(shiftedAmount)
        .send({ from: kit.defaultAccount });

      simpleToast.success(
        `You successfully withdrawn $${amount} from your lock`
      );

      queryClient.invalidateQueries('activeLock');
      withdrawDisclosure.onClose();
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  const onDeposit = async data => {
    console.log(data);

    const { amount } = data;
    const shiftedAmount = new BigNumber(amount)
      .shiftedBy(ERC20_DECIMALS)
      .toString();

    simpleToast.info('Waiting for payment approval...');

    try {
      await approve(kit, shiftedAmount);
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }

    simpleToast.info(`Attempting deposit of $${amount}`);

    try {
      await contract.methods
        .depositInLock(shiftedAmount)
        .send({ from: kit.defaultAccount });

      simpleToast.success(
        `You successfully deposited $${amount} into your lock`
      );

      queryClient.invalidateQueries('activeLock');
      withdrawDisclosure.onClose();
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  return (
    <>
      <Header balance={data.cUSDBalance} />

      <Box padding="4">
        <Text fontSize="2xl" fontWeight="medium">
          Home
        </Text>

        {activeLockQuery.status === 'loading' ? (
          <Center>
            <Spinner thickness="4px" size="xl" />
          </Center>
        ) : null}

        {activeLockQuery.status === 'error' ? (
          <Center>
            <Text>Unable to fetch user lock</Text>
          </Center>
        ) : null}

        {activeLockQuery.status === 'success' ? (
          <Flex mt="10" justifyContent="center" mx="5">
            {activeLockQuery.data.isActive &&
            activeLockQuery.data.balance > 0 ? (
              <Flex flexDir="column" alignItems="center">
                <Text fontSize="lg" fontWeight="bold">
                  Active lock:
                </Text>
                <Text fontSize="5xl" mb="10">
                  {new BigNumber(activeLockQuery.data.balance)
                    .shiftedBy(-ERC20_DECIMALS)
                    .toFixed(2)}{' '}
                  USD
                </Text>

                <ButtonGroup>
                  <Button
                    colorScheme="orange"
                    onClick={withdrawDisclosure.onOpen}
                  >
                    Withdraw from lock
                  </Button>
                  <Button
                    colorScheme="green"
                    variant="outline"
                    onClick={depositDisclosure.onOpen}
                  >
                    Deposit in lock
                  </Button>
                </ButtonGroup>
              </Flex>
            ) : (
              <Flex flexDir="column">
                <Text mb="5" padding="3" border="1px" borderColor="gray.300">
                  You don't currently have an active lock
                </Text>
                <Button onClick={newLockDisclosure.onOpen} cursor="pointer">
                  Create coin lock
                </Button>
              </Flex>
            )}
          </Flex>
        ) : null}

        <NewLockModal
          register={newLockForm.register}
          onSubmit={newLockForm.handleSubmit(onSubmit)}
          isOpen={newLockDisclosure.isOpen}
          onClose={newLockDisclosure.onClose}
        />

        <WithdrawModal
          register={withdrawForm.register}
          onSubmit={withdrawForm.handleSubmit(onWithdraw)}
          isOpen={withdrawDisclosure.isOpen}
          onClose={withdrawDisclosure.onClose}
          unlockDate={activeLockQuery.data?.unlockDate}
        />

        <DepositModal
          register={depositForm.register}
          onSubmit={depositForm.handleSubmit(onDeposit)}
          isOpen={depositDisclosure.isOpen}
          onClose={depositDisclosure.onClose}
          unlockDate={activeLockQuery.data?.unlockDate}
        />
      </Box>
    </>
  );
};

export default Home;
