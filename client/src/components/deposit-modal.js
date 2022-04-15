import {
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  VStack,
} from '@chakra-ui/react';

const DepositModal = ({ isOpen, onClose, onSubmit, register, unlockDate }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Deposit in lock</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="3">
            Coins have been locked till{' '}
            <Text fontWeight="bold">{new Date(unlockDate).toString()}</Text>
          </Text>

          <Text mb="7">You can add more coins to active lock.</Text>

          <form onSubmit={onSubmit}>
            <VStack spacing="5">
              <Input
                placeholder="Amount to withdraw"
                name="amount"
                type="number"
                {...register('amount')}
              />
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={onSubmit}>
            Deposit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DepositModal;
