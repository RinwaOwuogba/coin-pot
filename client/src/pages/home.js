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
import AsyncContent from '../components/async-content';

const Home = ({ data, cUSDBalance }) => {
  const { contract, kit } = data;

  const queryClient = useQueryClient();
  const activeLockQuery = useQuery('activeLock', async () => {
    // return {
    //   // isActive: true,
    //   isActive: false,
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

  const refreshBalances = () => {
    queryClient.invalidateQueries(['cUSDBalance']);
    queryClient.invalidateQueries(['activeLock']);
  };

  const onNewLock = async data => {
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

    simpleToast.info(`Awaiting deposit of $${amount}`);

    try {
      await contract.methods
        .newLock(shiftedAmount, days)
        .send({ from: kit.defaultAccount });

      simpleToast.success(
        `You successfully created a ${days} day(s) lock for $${amount}`
      );

      refreshBalances();
      newLockDisclosure.onClose();
      newLockForm.reset();
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  const onWithdraw = async data => {
    const { amount } = data;
    const shiftedAmount = new BigNumber(amount)
      .shiftedBy(ERC20_DECIMALS)
      .toFixed();

    simpleToast.info(`Attempting withdraw of $${amount}`);

    try {
      await contract.methods
        .withdrawFromLock(shiftedAmount)
        .send({ from: kit.defaultAccount });

      simpleToast.success(
        `You successfully withdrawn $${amount} from your lock`
      );

      refreshBalances();
      withdrawDisclosure.onClose();
      withdrawForm.reset();
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  const onDeposit = async data => {
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

      refreshBalances();
      depositDisclosure.onClose();
      depositForm.reset();
    } catch (error) {
      console.error(error);
      simpleToast.error(error.message);
    }
  };

  return (
    <>
      <Header balance={cUSDBalance} />

      <Box padding="4">
        <Text fontSize="xl" fontWeight="medium">
          Home
        </Text>

        <AsyncContent
          status={activeLockQuery.status}
          onLoading={() => (
            <Center>
              <Spinner thickness="4px" size="xl" />
            </Center>
          )}
          onError={() => (
            <Center>
              <Text>Unable to fetch user lock</Text>
            </Center>
          )}
          onSuccess={() => (
            <Flex mt="10" justifyContent="center" mx="5">
              <Flex flexDir="column" alignItems="center">
                <Text fontSize="lg" fontWeight="bold">
                  {activeLockQuery.data.isActive
                    ? 'Active lock balance'
                    : 'Inactive lock balance'}
                </Text>
                <Text fontSize="5xl" mb="10">
                  $
                  {new BigNumber(activeLockQuery.data.balance)
                    .shiftedBy(-ERC20_DECIMALS)
                    .toFixed(2)}{' '}
                </Text>

                {activeLockQuery.data.isActive ? (
                  <>
                    <Flex flexWrap="wrap" mb="3">
                      <Button
                        colorScheme="orange"
                        onClick={withdrawDisclosure.onOpen}
                        mr="5"
                        mb="5"
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
                    </Flex>
                    <Text bg="gray.200" borderRadius="md" p="3" fontSize="sm">
                      Coins are locked till{' '}
                      <Text as="span" fontWeight="bold">
                        {new Date(activeLockQuery.data.unlockDate).toString()}
                      </Text>
                    </Text>
                  </>
                ) : (
                  <>
                    <Flex flexWrap="wrap" mb="3">
                      <Button
                        colorScheme="orange"
                        onClick={withdrawDisclosure.onOpen}
                        mr="5"
                        mb="5"
                      >
                        Withdraw from lock
                      </Button>
                      <Button
                        onClick={newLockDisclosure.onOpen}
                        cursor="pointer"
                      >
                        Create coin lock
                      </Button>
                    </Flex>
                    <Text
                      mb="3"
                      bg="gray.200"
                      borderRadius="md"
                      p="3"
                      fontSize="sm"
                    >
                      Note that you need to have an active lock to qualify for
                      the lottery
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          )}
        />

        <NewLockModal
          register={newLockForm.register}
          onSubmit={newLockForm.handleSubmit(onNewLock)}
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
