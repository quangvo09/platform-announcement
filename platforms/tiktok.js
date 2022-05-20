import fetcher from "../utils/fetcher.js";
const API_URL = "https://developers.tiktok-shops.com/api/v1/document/tree";

export const scrape = async () => {
  try {
    const resp = await fetcher(API_URL);
    const data = JSON.parse(resp);
    const documents = data.data?.document_tree || [];
    const tree = buildTree(documents);
    const changelogNode = tree.find((node) => node.name == "Change log");
    const announcements = getLeaves(changelogNode)
      .reverse()
      .map((d) => ({
        id: d.document_id,
        platform: "tiktok",
        title: d.name,
        url: `https://developers.tiktok-shops.com/documents/document/${d.document_id}`,
      }));
    return announcements;
  } catch (error) {
    console.warn(error);
    return [];
  }
};

const getLeaves = (node) => {
  if (node.is_dir === 1 && !!node.children) {
    let leaves = [];
    node.children.forEach((n) => {
      leaves = leaves.concat(getLeaves(n));
    });
    return leaves;
  }

  if (node.is_dir === 1) {
    return [];
  }

  return [node];
};

const buildTree = (documents, parentId = "0") => {
  return documents
    .filter((doc) => doc.parent_id == parentId)
    .map((doc) => ({
      ...doc,
      children: buildTree(documents, doc.document_id),
    }));
};
