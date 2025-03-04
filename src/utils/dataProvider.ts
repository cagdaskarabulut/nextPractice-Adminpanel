import { DataProvider, CreateParams, CreateResult, RaRecord, Identifier } from 'ra-core';

const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const url = new URL(`/api/${resource}`, window.location.origin);

    // Filtreleme, sıralama ve sayfalama parametrelerini ekle
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());
    const json = await response.json();

    // API'den gelen veriyi React Admin'in beklediği formata dönüştür
    return {
      data: Array.isArray(json) ? json : [],
      total: Array.isArray(json) ? json.length : 0,
    };
  },

  getOne: async (resource, { id }) => {
    const response = await fetch(`/api/${resource}/${id}`);
    const json = await response.json();

    return {
      data: json,
    };
  },

  create: async <RecordType extends Omit<RaRecord, "id">>(
    resource: string,
    params: CreateParams<RecordType>
  ): Promise<CreateResult<RecordType & { id: Identifier }>> => {
    const response = await fetch(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();

    return {
      data: { ...params.data, id: json.id } as RecordType & { id: Identifier },
    };
  },

  update: async (resource, { id, data }) => {
    const response = await fetch(`/api/${resource}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();

    return {
      data: json,
    };
  },

  delete: async (resource, { id }) => {
    const response = await fetch(`/api/${resource}?id=${id}`, {
      method: 'DELETE',
    });
    const json = await response.json();

    return {
      data: json,
    };
  },

  deleteMany: async (resource, { ids }) => {
    const deletePromises = ids.map(id =>
      fetch(`/api/${resource}?id=${String(id)}`, {
        method: 'DELETE',
      }).then(response => response.json())
    );

    await Promise.all(deletePromises);

    return {
      data: ids,
    };
  },

  getMany: async (resource, { ids }) => {
    const fetchPromises = ids.map(id =>
      fetch(`/api/${resource}/${String(id)}`).then(response => response.json())
    );

    const results = await Promise.all(fetchPromises);

    return {
      data: results,
    };
  },

  getManyReference: async (resource, { target, id, ...params }) => {
    const url = new URL(`/api/${resource}`, window.location.origin);
    url.searchParams.append(target, String(id));

    const response = await fetch(url.toString());
    const json = await response.json();

    return {
      data: Array.isArray(json) ? json : [],
      total: Array.isArray(json) ? json.length : 0,
    };
  },

  updateMany: async (resource, { ids, data }) => {
    const updatePromises = ids.map(id =>
      fetch(`/api/${resource}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, id }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.json())
    );

    await Promise.all(updatePromises);

    return {
      data: ids,
    };
  },
};

export default dataProvider; 