const typeMap = new Map<string, SerializableType<any, any>>();

export function Serializable<TData, T>() {
  return (type: SerializableType<TData, T>) => {
    typeMap.set(type.name, type);
  };
}

export async function deserialize<TData>(typeName: string, data: TData): Promise<any>;
export async function deserialize<T, TData>(type: SerializableType<TData, T>, data: TData): Promise<T>;
export async function deserialize<T, TData>(typeOrName: SerializableType<TData, T>|SerializableType<TData, T>['name'], data: TData) {
  let type: SerializableType<TData, T>;
  if(typeof typeOrName === 'string') {
    const path = `./${typeOrName}.js`;
    const mod = await import(path);
    type = mod[typeOrName];
    if(!type) throw new Error(`Module ${path} didn't export a type called ${typeOrName}`);
  }
  else type = typeOrName;
  return type.deserialize(data);
}

type SerializableType<TData, T> = {
  new(...args: any[]): T;
  deserialize(data: TData): Promise<T>;
};
