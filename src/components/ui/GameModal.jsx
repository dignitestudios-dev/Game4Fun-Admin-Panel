import { Controller, useForm } from "react-hook-form";
import Modal from "./Modal";
import ImageUploader from "./ImageUploader";
import Input from "./Input";
import Button from "./Button";

function GameModal({ isOpen, onClose, onSave, defaultValues }) {
  const { control, register, handleSubmit } = useForm({
    defaultValues: defaultValues || {
      gameName: "",
      description: "",
      gamesImages: null,
      ultraMinimumFPS: "",
      ultraAverageFPS: "",
      ultraMaximumFPS: "",
      highMinimumFPS: "",
      highAverageFPS: "",
      highMaximumFPS: "",
      mediumMinimumFPS: "",
      mediumAverageFPS: "",
      mediumMaximumFPS: "",
      lowMinimumFPS: "",
      lowAverageFPS: "",
      lowMaximumFPS: "",
    },
  });

  const onSubmit = (data) => {
    onSave(data); // call parent to handle create/update
    // onClose();
  };

  return (
    <Modal isOpen={isOpen} className="z-[99999]" onClose={onClose} title={defaultValues ? "Edit Game" : "Add Game"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Game Name" {...register("gameName", { required: "Required" })} />
        <Input label="Game Description" {...register("description", { required: "Required" })} />

        <Controller
          name="gamesImages"
          control={control}
          render={({ field: { onChange, value } }) => (
            <ImageUploader
              onChange={(files) => onChange(files[0])}
              value={value ? [value] : []}
              label="Game Image"
              multiple={false}
            />
          )}
        />

        <h6 className="font-semibold text-gray-300 mt-3">FPS Benchmarks</h6>
        {["ultra", "high", "medium", "low"].map((level) => (
          <div key={level} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Input label={`${level} Min FPS`} type="number" {...register(`${level}MinimumFPS`)} />
            <Input label={`${level} Avg FPS`} type="number" {...register(`${level}AverageFPS`)} />
            <Input label={`${level} Max FPS`} type="number" {...register(`${level}MaximumFPS`)} />
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">{defaultValues ? "Update Game" : "Add Game"}</Button>
        </div>
      </form>
    </Modal>
  );
}
export default GameModal