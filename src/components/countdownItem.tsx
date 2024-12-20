// import ProgressBorder from './progressBorder';

export default function CountdownItem({
  time,
  period,
}: {
  time: number;
  period: string;
}) {
  // let total: number | undefined;

  // if (period === 'Day') {
  //   total = 7;
  // } else if (period === 'Hour') {
  //   total = 24;
  // } else if (period === 'Minute') {
  //   total = 60;
  // } else if (period === 'Second') {
  //   total = 60;
  // } else {
  //   throw new Error('Invalid period');
  // }
  // const progress = (time / total) * 100;

  return (
    <>
      {/* <ProgressBorder progress={progress}> */}
      <div className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20">
        {/* <div className='flex flex-col justify-center items-center  min-h-full '> */}
        <p className="text-lg leading-none">{time}</p>
        <p className="my-[2px] text-[0.8rem] leading-none">
          {time === 1 ? `${period}` : `${period}s`}
        </p>
      </div>
      {/* </ProgressBorder> */}
    </>
  );
}
