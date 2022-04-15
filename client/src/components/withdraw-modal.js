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

const WithdrawModal = ({ isOpen, onClose, onSubmit, register, unlockDate }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Withdraw from coin lock</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="3">
            Coins have been locked till{' '}
            <Text fontWeight="bold">{new Date(unlockDate).toString()}</Text>
          </Text>

          <Text mb="7">
            Note that early withdrawal attracts a fee of 5% which goes into the
            lottery pot.
          </Text>

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
            Withdraw
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WithdrawModal;
