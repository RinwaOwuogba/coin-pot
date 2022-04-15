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
          <Text mb="7">Add more coins to lock.</Text>

          <form onSubmit={onSubmit}>
            <VStack spacing="5">
              <Input
                placeholder="Amount to deposit"
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
