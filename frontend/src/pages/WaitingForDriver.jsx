

const WaitingForDriver = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4">Waiting for Driver...</h2>
      <p className="text-lg">Your ride is being assigned. Please wait.</p>
      <div className="mt-8 animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
  );
};

export default WaitingForDriver;
