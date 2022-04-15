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

const NewLockModal = ({ isOpen, onClose, onSubmit, register }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New coin lock</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb="3">Lock your CUSD for a number of days</Text>

          <Text mb="7">
            Note that early withdrawal attracts a fee of 5% which goes into the
            lottery pot.
          </Text>

          <form onSubmit={onSubmit}>
            <VStack spacing="5">
              <Input
                placeholder="Amount to lock"
                name="amount"
                type="number"
                {...register('amount')}
              />
              <Input
                placeholder="Number of days to lock"
                name="days"
                type="number"
                {...register('days')}
              />
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={onSubmit}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NewLockModal;
