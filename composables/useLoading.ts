import { ref } from 'vue';

const loading = ref(false);
let requestCount = 0;

export function useLoading() {
  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      requestCount++;
      loading.value = true;
    } else {
      requestCount--;
      if (requestCount <= 0) {
        loading.value = false;
        requestCount = 0;
      }
    }
  };

  return { loading, setLoading };
}
