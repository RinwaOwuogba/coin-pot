const AsyncContent = ({ onSuccess, onError, onLoading, status }) => {
  switch (status) {
    case 'success':
      return onSuccess();
    case 'error':
      return onError();
    case 'loading':
      return onLoading();
    default:
      throw new Error('Invalid status');
  }
};

export default AsyncContent;
