import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate:followUnfollow, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/users/follow/${userId}`, {
          method: "POST",
        })
  
        const data = await res.json();
        if(!res.ok){
          throw new Error(data.error || "Failed to follow/unfollow user");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess:() => {
      Promise.all([
        queryClient.invalidateQueries({queryKey: ["suggestedUsers"]}),
        queryClient.invalidateQueries({queryKey: ["authUser"]})
      ])
    },
    onError:() => {
      toast.error("Failed to follow/unfollow user");
    } 
  })

  return { followUnfollow, isPending };
};

export default useFollow;