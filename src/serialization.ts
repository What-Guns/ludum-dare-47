const typeMap = new Map<string, SerializableType<any, any>>();

type SerializableType<TData, T> = {
  new(...args: any[]): T;
  deserialize(data: TData): Promise<T>;
};

export function Serializable<TData, T>() {
  return (type: SerializableType<TData, T>) => {
    typeMap.set(type.name, type);
  };
}

export function deserialize<T, TData>(typeName: SerializableType<TData, T>['name'], data: TData) {
  const type = typeMap.get(typeName);
  if(!type) throw new Error(`Type ${typeName} not registered.`);
  return type.deserialize(data);
}
