export function Intro() {
  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col justify-center min-h-screen">
        <div className="pb-4">
          <h2 className="text-2xl">
            Welcome
            <br />
            my name is
          </h2>
          <h1 className="text-6xl font-medium">Ethan.</h1>
        </div>
        <div className="pb-4">
          <h2 className="text-2xl">I am a</h2>
          <h1 className="text-6xl font-medium">Software Engineer.</h1>
        </div>
        <p className="text-lg">
          I specialize in
          <span className="font-bold"> full stack </span> development with
          <span className="font-bold"> web</span> and
          <span className="font-bold"> mobile</span> applications.
        </p>
      </div>
    </div>
  );
}
